import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  type StripeEnv,
  createStripeClient,
  getWebhookSecret,
} from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "stripe-signature, content-type",
};

const PRICE_TO_TIER: Record<string, "silver" | "gold"> = {
  silver_monthly: "silver",
  gold_monthly: "gold",
};

const TOPUP_AMOUNTS: Record<string, number> = {
  topup_50: 5000,
  topup_100: 10000,
  topup_200: 20000,
  topup_500: 50000,
};

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const envParam = url.searchParams.get("env");
  const environment: StripeEnv = envParam === "live" ? "live" : "sandbox";

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const raw = await req.text();
  const stripe = createStripeClient(environment);
  const webhookSecret = getWebhookSecret(environment);

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, webhookSecret);
  } catch (err) {
    console.error("Invalid signature", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const db = admin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as any;
        const userId = s.metadata?.userId;
        const priceId = s.metadata?.priceId;
        if (!userId || !priceId) break;

        // Wallet topup
        const amount = TOPUP_AMOUNTS[priceId];
        if (amount && s.mode === "payment" && s.payment_status === "paid") {
          const { data: bal } = await db
            .from("wallet_balances")
            .select("balance_cents")
            .eq("user_id", userId)
            .maybeSingle();
          const current = bal?.balance_cents ?? 0;
          await db
            .from("wallet_balances")
            .update({ balance_cents: current + amount })
            .eq("user_id", userId);
          await db.from("wallet_transactions").insert({
            user_id: userId,
            kind: "topup",
            description: `Recarga via Stripe (R$ ${(amount / 100).toFixed(2)})`,
            amount_cents: amount,
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        const lookupKey = sub.items?.data?.[0]?.price?.lookup_key;
        const tier = lookupKey ? PRICE_TO_TIER[lookupKey] : null;
        if (!tier) break;
        const renewsAt = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
        await db
          .from("wallet_balances")
          .update({ plan: tier, plan_renews_at: renewsAt })
          .eq("user_id", userId);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await db
          .from("wallet_balances")
          .update({ plan: "bronze", plan_renews_at: null })
          .eq("user_id", userId);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});