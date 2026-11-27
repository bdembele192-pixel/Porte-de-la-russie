// Tests des fonctions de paiement avec une base et des prestataires simulés (fetch intercepté).
// deno test -A trading/supabase/tests/functions_test.ts
import { assert, assertEquals } from "jsr:@std/assert@1";

const SB = "https://db.test";
Deno.env.set("SUPABASE_URL", SB);
Deno.env.set("SUPABASE_ANON_KEY", "anon");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "service");
Deno.env.set("STRIPE_SECRET_KEY", "sk_test_x");
Deno.env.set("STRIPE_WEBHOOK_SECRET", "whsec_test");
Deno.env.set("CINETPAY_APIKEY", "ck");
Deno.env.set("CINETPAY_SITE_ID", "42");

type Row = Record<string, unknown>;
const db: { payments: Row[]; grants: string[]; plans: Row[]; stripe: URLSearchParams[]; cinet: Row } = {
  payments: [], grants: [], stripe: [], cinet: {},
  plans: [
    { id: "premium", name: "Premium", period_days: 30, active: true, prices: { XOF: 2500, EUR: 3.99, RUB: null } },
    { id: "pro", name: "Pro", period_days: 30, active: true, prices: { XOF: null, EUR: null, RUB: null } }
  ]
};
const realFetch = globalThis.fetch;
const J = (d: unknown, s = 200, h: Record<string, string> = {}) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...h } });
function filt(rows: Row[], u: URL) {
  let out = rows;
  for (const [k, v] of u.searchParams) {
    if (["select", "order", "limit", "on_conflict"].includes(k)) continue;
    const [op, ...rest] = v.split("."); const val = rest.join(".");
    out = out.filter(r => op === "eq" ? String(r[k]) === val : op === "gte" ? String(r[k]) >= val : true);
  }
  return out;
}
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const req = new Request(input, init);
  const u = new URL(req.url);
  if (u.origin === SB) {
    if (u.pathname === "/auth/v1/user") return req.headers.get("authorization") === "Bearer good" ? J({ id: "u1", email: "a@b.c", aud: "authenticated" }) : J({ msg: "bad jwt" }, 401);
    const table = u.pathname.replace("/rest/v1/", "");
    const single = (req.headers.get("accept") || "").includes("vnd.pgrst.object");
    if (table === "rpc/grant_subscription") { db.grants.push((await req.json()).p_payment); return new Response(null, { status: 204 }); }
    const rows = (db as unknown as Record<string, Row[]>)[table];
    if (req.method === "GET" || req.method === "HEAD") {
      const r = filt(rows, u);
      if (req.method === "HEAD") return new Response(null, { status: 200, headers: { "content-range": `0-0/${r.length}` } });
      return single ? (r.length ? J(r[0]) : J({ code: "PGRST116" }, 406)) : J(r);
    }
    if (req.method === "POST") { const b = await req.json(); const row = { id: crypto.randomUUID(), status: "pending", created_at: new Date().toISOString(), ...b }; rows.push(row); return J(single ? row : [row], 201); }
    if (req.method === "PATCH") { const b = await req.json(); const r = filt(rows, u); r.forEach(x => Object.assign(x, b)); return J(r); }
  }
  if (u.hostname === "api.stripe.com") { db.stripe.push(new URLSearchParams(await req.text())); return J({ id: "cs_test_1", url: "https://checkout.stripe.com/c/pay/cs_test_1" }); }
  if (u.hostname === "api-checkout.cinetpay.com" && u.pathname.endsWith("/check")) return J(db.cinet);
  if (u.hostname === "api-checkout.cinetpay.com") return J({ code: "201", data: { payment_url: "https://checkout.cinetpay.com/payment/x" } });
  return realFetch(input, init);
};

// Capture des gestionnaires Deno.serve sans ouvrir de port
const handlers: ((r: Request) => Promise<Response>)[] = [];
(Deno as unknown as { serve: unknown }).serve = (h: (r: Request) => Promise<Response>) => { handlers.push(h); return {}; };
await import("../functions/checkout/index.ts");
await import("../functions/payment-webhook/index.ts");
const [checkout, webhook] = handlers;
const post = (h: typeof checkout, url: string, body: unknown, headers: Record<string, string> = {}) =>
  h(new Request(url, { method: "POST", headers: { "content-type": "application/json", origin: "https://bdembele192-pixel.github.io", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) }));

async function stripeSig(body: string, t = Math.floor(Date.now() / 1000), secret = "whsec_test") {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = [...new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(`${t}.${body}`)))].map(b => b.toString(16).padStart(2, "0")).join("");
  return `t=${t},v1=${s}`;
}

Deno.test("checkout refuse un visiteur non connecté", async () => {
  const r = await post(checkout, "https://f/checkout", { plan_id: "premium", provider: "stripe" }, { authorization: "Bearer bad" });
  assertEquals(r.status, 401);
});
Deno.test("checkout refuse une offre sans prix", async () => {
  const r = await post(checkout, "https://f/checkout", { plan_id: "pro", provider: "stripe" }, { authorization: "Bearer good" });
  assertEquals(r.status, 409);
});
Deno.test("checkout Stripe : prix pris dans la base, pas dans la requête", async () => {
  const r = await post(checkout, "https://f/checkout", { plan_id: "premium", provider: "stripe", amount: 0.01 }, { authorization: "Bearer good" });
  assertEquals(r.status, 200);
  const d = await r.json();
  assert(d.url.startsWith("https://checkout.stripe.com/"));
  assertEquals(db.stripe.at(-1)!.get("line_items[0][price_data][unit_amount]"), "399");
  const p = db.payments.find(x => x.id === d.payment_id)!;
  assertEquals([p.amount, p.currency, p.status, p.provider_ref], [3.99, "EUR", "pending", "cs_test_1"]);
  assertEquals(r.headers.get("access-control-allow-origin"), "https://bdembele192-pixel.github.io");
});
Deno.test("webhook Stripe : signature invalide rejetée", async () => {
  const body = JSON.stringify({ type: "checkout.session.completed", data: { object: { payment_status: "paid", amount_total: 399, currency: "eur", metadata: { payment_id: db.payments[0].id } } } });
  const r = await post(webhook, "https://f/payment-webhook?provider=stripe", body, { "stripe-signature": await stripeSig(body, undefined, "whsec_faux") });
  assertEquals(r.status, 400);
  assertEquals(db.grants.length, 0);
});
Deno.test("webhook Stripe : montant différent ignoré", async () => {
  const body = JSON.stringify({ type: "checkout.session.completed", data: { object: { id: "cs", payment_status: "paid", amount_total: 1, currency: "eur", metadata: { payment_id: db.payments[0].id } } } });
  const r = await post(webhook, "https://f/payment-webhook?provider=stripe", body, { "stripe-signature": await stripeSig(body) });
  assertEquals(r.status, 200);
  assertEquals(db.payments[0].status, "pending");
  assertEquals(db.grants.length, 0);
});
Deno.test("webhook Stripe : paiement valide → abonnement prolongé une seule fois", async () => {
  const body = JSON.stringify({ type: "checkout.session.completed", data: { object: { id: "cs", payment_status: "paid", amount_total: 399, currency: "eur", metadata: { payment_id: db.payments[0].id } } } });
  const sig = await stripeSig(body);
  await post(webhook, "https://f/payment-webhook?provider=stripe", body, { "stripe-signature": sig });
  await post(webhook, "https://f/payment-webhook?provider=stripe", body, { "stripe-signature": sig }); // notification rejouée
  assertEquals(db.payments[0].status, "paid");
  assertEquals(db.grants, [db.payments[0].id]);
});
Deno.test("webhook Stripe : signature trop ancienne rejetée", async () => {
  const body = "{}";
  const r = await post(webhook, "https://f/payment-webhook?provider=stripe", body, { "stripe-signature": await stripeSig(body, Math.floor(Date.now() / 1000) - 3600) });
  assertEquals(r.status, 400);
});
Deno.test("CinetPay : vérification par l'API puis retour client redirigé", async () => {
  const r = await post(checkout, "https://f/checkout", { plan_id: "premium", provider: "cinetpay" }, { authorization: "Bearer good" });
  const { payment_id } = await r.json();
  const tid = payment_id.replace(/-/g, "");
  // Notification sans paiement accepté : rien
  db.cinet = { code: "627", data: { status: "PENDING" } };
  await post(webhook, "https://f/payment-webhook?provider=cinetpay", `cpm_trans_id=${tid}&cpm_site_id=42`, { "content-type": "application/x-www-form-urlencoded" });
  assertEquals(db.payments.find(x => x.id === payment_id)!.status, "pending");
  // Paiement accepté : retour du client en POST → vérification + redirection vers l'app
  db.cinet = { code: "00", data: { status: "ACCEPTED", amount: "2500", currency: "XOF", payment_method: "OM" } };
  const back = await webhook(new Request("https://f/payment-webhook?provider=cinetpay&return=1", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: `transaction_id=${tid}&token=x` }));
  assertEquals(back.status, 303);
  assert(back.headers.get("location")!.endsWith("#/abonnement/ok"));
  assertEquals(db.payments.find(x => x.id === payment_id)!.status, "paid");
  assert(db.grants.includes(payment_id));
});
