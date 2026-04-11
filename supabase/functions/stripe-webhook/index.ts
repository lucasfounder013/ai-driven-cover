import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    logStep("ERROR", { message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" });
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    logStep("ERROR", { message: "No stripe-signature header" });
    return new Response(JSON.stringify({ error: "No signature" }), { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Signature verification failed", { message: msg });
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!customerEmail) {
          logStep("No customer email in checkout session");
          break;
        }

        // Determine plan from subscription
        let plan: string | null = null;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price?.id;
          if (priceId === "price_1Saae7JDrYaA8zu3ZPwQyUhc") {
            plan = "weekly";
          } else if (priceId === "price_1SaadvJDrYaA8zu34NVADeb3") {
            plan = "monthly";
          }
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: "active",
            subscription_plan: plan,
            has_active_subscription: true,
          })
          .eq("email", customerEmail);

        logStep("checkout.session.completed processed", { customerEmail, customerId, subscriptionId, plan, error });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;
        if (!email) {
          logStep("No email for customer", { customerId });
          break;
        }

        let plan: string | null = null;
        const priceId = subscription.items.data[0]?.price?.id;
        if (priceId === "price_1Saae7JDrYaA8zu3ZPwQyUhc") {
          plan = "weekly";
        } else if (priceId === "price_1SaadvJDrYaA8zu34NVADeb3") {
          plan = "monthly";
        }

        const isActive = status === "active" || status === "trialing";

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: isActive ? "active" : status,
            subscription_plan: plan,
            has_active_subscription: isActive,
            stripe_subscription_id: subscription.id,
          })
          .eq("email", email);

        logStep("customer.subscription.updated processed", { email, status, plan, error });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        const email = (customer as Stripe.Customer).email;
        if (!email) {
          logStep("No email for customer", { customerId });
          break;
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
            subscription_plan: null,
            stripe_subscription_id: null,
            has_active_subscription: false,
            subscription_end_date: null,
          })
          .eq("email", email);

        logStep("customer.subscription.deleted processed", { email, error });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Error processing event", { message: msg });
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
