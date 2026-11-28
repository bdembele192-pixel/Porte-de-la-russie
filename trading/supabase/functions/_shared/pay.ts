// Outils communs aux fonctions de paiement de Mèche (Supabase Edge Functions, Deno).
// Les clés secrètes ne sont lues que dans les variables d'environnement du serveur (supabase secrets set …).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.119.2";

export const env = (k: string) => Deno.env.get(k) || "";

// Origines autorisées à appeler les fonctions depuis un navigateur (l'app publiée, et localhost pour les tests)
const ORIGINS = (env("ALLOWED_ORIGINS") || "https://bdembele192-pixel.github.io,http://localhost:8765").split(",").map(s => s.trim());
export function cors(req: Request) {
  const o = req.headers.get("origin") || "";
  return {
    "access-control-allow-origin": ORIGINS.includes(o) ? o : ORIGINS[0],
    "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
    "access-control-allow-methods": "POST, OPTIONS",
    vary: "origin"
  };
}
export const json = (data: unknown, status = 200, h: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...h } });

// Client « service » : contourne la RLS, réservé au serveur
export const admin = () => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

// Adresse de l'app (retour après paiement)
export const APP_URL = () => (env("APP_URL") || "https://bdembele192-pixel.github.io/Porte-de-la-russie/trading/").replace(/\/?$/, "/");
export const FN_URL = () => env("SUPABASE_URL").replace(/\/$/, "") + "/functions/v1";

export async function hmacHex(key: string, msg: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}
// Comparaison en temps constant (évite de deviner une signature caractère par caractère)
export function safeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// Marque un paiement comme payé (une seule fois) puis prolonge l'abonnement
export async function markPaid(paymentId: string, check: { amount?: number; currency?: string; ref?: string; details?: unknown }) {
  const db = admin();
  const { data: pay, error } = await db.from("payments").select("*").eq("id", paymentId).maybeSingle();
  if (error || !pay) return { ok: false, why: "paiement inconnu" };
  if (pay.status === "paid") return { ok: true, already: true };
  if (check.amount != null && Math.abs(Number(pay.amount) - Number(check.amount)) > 0.01) return { ok: false, why: "montant différent" };
  if (check.currency && check.currency.toUpperCase() !== pay.currency) return { ok: false, why: "devise différente" };
  const { data: upd } = await db.from("payments").update({ status: "paid", paid_at: new Date().toISOString(), provider_ref: check.ref || pay.provider_ref, details: check.details ?? null })
    .eq("id", paymentId).eq("status", "pending").select("id");
  if (!upd || !upd.length) return { ok: true, already: true }; // traité en parallèle par une autre notification
  const { error: e2 } = await db.rpc("grant_subscription", { p_payment: paymentId });
  if (e2) return { ok: false, why: e2.message };
  return { ok: true };
}
export async function markFailed(paymentId: string, status: "failed" | "canceled", details?: unknown) {
  await admin().from("payments").update({ status, details: details ?? null }).eq("id", paymentId).eq("status", "pending");
}
