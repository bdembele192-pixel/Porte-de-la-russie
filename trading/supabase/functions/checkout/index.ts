// POST /functions/v1/checkout  { plan_id, provider: "cinetpay" | "stripe" }
// Crée un paiement « en attente » puis renvoie l'adresse de la page de paiement du prestataire.
// Le prix vient TOUJOURS de la table plans (jamais du navigateur).
import { admin, APP_URL, cors, env, FN_URL, json } from "../_shared/pay.ts";

const CURRENCY: Record<string, string> = { cinetpay: "XOF", stripe: env("STRIPE_CURRENCY") || "EUR" };

Deno.serve(async (req) => {
  const h = cors(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: h });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405, h);
  try {
    // Utilisateur connecté (le jeton Supabase est vérifié par la plateforme puis relu ici)
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const db = admin();
    const { data: { user } } = token ? await db.auth.getUser(token) : { data: { user: null } };
    if (!user) return json({ error: "Connecte-toi pour t'abonner." }, 401, h);

    const { plan_id, provider } = await req.json().catch(() => ({}));
    if (!["cinetpay", "stripe"].includes(provider)) return json({ error: "Moyen de paiement inconnu." }, 400, h);
    const { data: plan } = await db.from("plans").select("*").eq("id", plan_id).eq("active", true).maybeSingle();
    if (!plan) return json({ error: "Offre introuvable." }, 404, h);
    const currency = CURRENCY[provider];
    const amount = Number(plan.prices?.[currency]);
    if (!(amount > 0)) return json({ error: "Le prix de cette offre n'est pas encore fixé dans cette devise." }, 409, h);
    if (provider === "cinetpay" && amount % 5 !== 0) return json({ error: "Le prix en FCFA doit être un multiple de 5." }, 409, h);

    // Limite simple : 5 paiements en attente maximum par heure et par utilisateur
    const since = new Date(Date.now() - 3600e3).toISOString();
    const { count } = await db.from("payments").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending").gte("created_at", since);
    if ((count || 0) >= 5) return json({ error: "Trop de tentatives de paiement. Réessaie dans une heure." }, 429, h);

    const { data: pay, error } = await db.from("payments").insert({ user_id: user.id, plan_id, provider, amount, currency }).select("id").single();
    if (error) throw error;
    const back = APP_URL() + "#/abonnement";
    let url = "", ref = "";

    if (provider === "stripe") {
      const key = env("STRIPE_SECRET_KEY");
      if (!key) return json({ error: "Paiement par carte pas encore configuré." }, 503, h);
      const f = new URLSearchParams({
        mode: "payment", "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": currency.toLowerCase(),
        "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
        "line_items[0][price_data][product_data][name]": `Mèche ${plan.name} (${plan.period_days} jours)`,
        success_url: back + "/ok", cancel_url: back + "/annule",
        client_reference_id: pay.id, "metadata[payment_id]": pay.id, "payment_intent_data[metadata][payment_id]": pay.id
      });
      if (user.email) f.set("customer_email", user.email);
      const r = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { authorization: "Bearer " + key, "content-type": "application/x-www-form-urlencoded", "idempotency-key": pay.id }, body: f });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || "Stripe indisponible");
      url = d.url; ref = d.id;
    }

    if (provider === "cinetpay") {
      if (!env("CINETPAY_APIKEY") || !env("CINETPAY_SITE_ID")) return json({ error: "Paiement mobile money pas encore configuré." }, 503, h);
      const r = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          apikey: env("CINETPAY_APIKEY"), site_id: env("CINETPAY_SITE_ID"), transaction_id: pay.id.replace(/-/g, ""),
          amount, currency: "XOF", description: `Abonnement Meche ${plan.name}`.replace(/[^\w\s.-]/g, ""),
          notify_url: FN_URL() + "/payment-webhook?provider=cinetpay", return_url: FN_URL() + "/payment-webhook?provider=cinetpay&return=1",
          channels: "ALL", lang: "fr", metadata: pay.id
        })
      });
      const d = await r.json();
      if (d.code !== "201" || !d.data?.payment_url) throw new Error(d.description || d.message || "CinetPay indisponible");
      url = d.data.payment_url; ref = pay.id.replace(/-/g, "");
    }

    await db.from("payments").update({ provider_ref: ref }).eq("id", pay.id);
    return json({ url, payment_id: pay.id }, 200, h);
  } catch (e) {
    console.error(e);
    return json({ error: "Paiement impossible pour le moment." }, 502, h);
  }
});
