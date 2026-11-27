// POST /functions/v1/payment-webhook?provider=stripe|cinetpay|yookassa
// Notifications des prestataires de paiement. Rien n'est cru sur parole :
//   · Stripe : signature HMAC de l'en-tête Stripe-Signature vérifiée avec STRIPE_WEBHOOK_SECRET ;
//   · CinetPay et YooKassa : le paiement est revérifié en interrogeant directement leur API.
// L'abonnement n'est prolongé que si le montant et la devise correspondent au paiement enregistré.
import { APP_URL, env, hmacHex, json, markFailed, markPaid, safeEq } from "../_shared/pay.ts";

const uuid = (s: string) => s.length === 32 ? `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}` : s;

function cinetTid(raw: string) {
  const f = new URLSearchParams(raw);
  let tid = f.get("cpm_trans_id") || f.get("transaction_id");
  if (!tid) { try { const j = JSON.parse(raw); tid = j.cpm_trans_id || j.transaction_id; } catch { /* corps vide */ } }
  return tid && /^[a-f0-9]{32}$/.test(tid) ? tid : null;
}
// Vérification auprès de l'API CinetPay (la notification elle-même n'est pas crue)
async function verifyCinetpay(tid: string) {
  const r = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ apikey: env("CINETPAY_APIKEY"), site_id: env("CINETPAY_SITE_ID"), transaction_id: tid })
  });
  const d = await r.json();
  const st = d.data?.status;
  if (d.code === "00" && st === "ACCEPTED") {
    const res = await markPaid(uuid(tid), { amount: Number(d.data.amount), currency: d.data.currency, ref: tid, details: { method: d.data.payment_method } });
    if (!res.ok) console.error("cinetpay", res.why);
    return res.ok;
  }
  if (st === "REFUSED" || st === "CANCELED") await markFailed(uuid(tid), st === "CANCELED" ? "canceled" : "failed");
  return false;
}

Deno.serve(async (req) => {
  const u = new URL(req.url), provider = u.searchParams.get("provider");
  // Retour du client après paiement (CinetPay le renvoie en POST, impossible sur une page GitHub Pages) :
  // on vérifie le paiement puis on redirige vers l'app.
  if (u.searchParams.get("return") === "1") {
    let ok = false;
    try { const tid = cinetTid(req.method === "POST" ? await req.text() : u.search.slice(1)); if (provider === "cinetpay" && tid) ok = await verifyCinetpay(tid); } catch (e) { console.error(e); }
    return new Response(null, { status: 303, headers: { location: APP_URL() + "#/abonnement/" + (ok ? "ok" : "retour") } });
  }
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  const raw = await req.text();
  try {
    if (provider === "stripe") {
      const sig = req.headers.get("stripe-signature") || "", secret = env("STRIPE_WEBHOOK_SECRET");
      const parts = Object.fromEntries(sig.split(",").map(p => p.split("=")).filter(p => p.length === 2)) as Record<string, string>;
      const t = Number(parts.t);
      if (!secret || !t || Math.abs(Date.now() / 1000 - t) > 300) return json({ error: "signature" }, 400);
      const expected = await hmacHex(secret, `${parts.t}.${raw}`);
      const v1s = sig.split(",").filter(p => p.startsWith("v1=")).map(p => p.slice(3));
      if (!v1s.some(v => safeEq(v, expected))) return json({ error: "signature" }, 400);
      const ev = JSON.parse(raw);
      const s = ev.data?.object || {};
      const id = s.metadata?.payment_id || s.client_reference_id;
      if (ev.type === "checkout.session.completed" || ev.type === "checkout.session.async_payment_succeeded") {
        if (s.payment_status === "paid" && id) {
          const r = await markPaid(id, { amount: (s.amount_total || 0) / 100, currency: s.currency, ref: s.id, details: { session: s.id } });
          if (!r.ok) console.error("stripe", r.why);
        }
      } else if ((ev.type === "checkout.session.expired" || ev.type === "checkout.session.async_payment_failed") && id) {
        await markFailed(id, ev.type.endsWith("expired") ? "canceled" : "failed");
      }
      return json({ received: true });
    }

    if (provider === "cinetpay") {
      const tid = cinetTid(raw);
      if (!tid) return json({ error: "transaction" }, 400);
      await verifyCinetpay(tid);
      return json({ received: true });
    }

    if (provider === "yookassa") {
      const ev = JSON.parse(raw);
      const pid = ev.object?.id;
      if (!pid || !/^[\w-]{10,64}$/.test(pid)) return json({ error: "paiement" }, 400);
      const r = await fetch("https://api.yookassa.ru/v3/payments/" + pid, {
        headers: { authorization: "Basic " + btoa(env("YOOKASSA_SHOP_ID") + ":" + env("YOOKASSA_SECRET_KEY")) }
      });
      const p = await r.json();
      const id = p.metadata?.payment_id;
      if (p.status === "succeeded" && p.paid && id) {
        const res = await markPaid(id, { amount: Number(p.amount?.value), currency: p.amount?.currency, ref: p.id });
        if (!res.ok) console.error("yookassa", res.why);
      } else if (p.status === "canceled" && id) {
        await markFailed(id, "canceled", { reason: p.cancellation_details?.reason });
      }
      return json({ received: true });
    }
    return json({ error: "prestataire inconnu" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "erreur" }, 500);
  }
});
