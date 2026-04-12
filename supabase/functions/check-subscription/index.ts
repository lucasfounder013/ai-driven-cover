import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth client with anon key for token validation
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Service role client for DB writes
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, user is on free plan");
      
      await supabaseAdmin
        .from('profiles')
        .update({ 
          has_active_subscription: false,
          subscription_status: 'free',
          subscription_end_date: null 
        })
        .eq('id', user.id);

      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_end: null,
        subscription_plan: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;
    let subscriptionPlan = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      
      // Log raw value for debugging
      logStep("Raw current_period_end", { value: subscription.current_period_end, type: typeof subscription.current_period_end });
      
      try {
        const periodEnd = Number(subscription.current_period_end);
        if (!isNaN(periodEnd) && periodEnd > 0) {
          subscriptionEnd = new Date(periodEnd * 1000).toISOString();
        } else {
          logStep("current_period_end is not a valid number, trying direct Date parse");
          const directDate = new Date(subscription.current_period_end);
          if (!isNaN(directDate.getTime())) {
            subscriptionEnd = directDate.toISOString();
          }
        }
      } catch (dateError) {
        logStep("Failed to convert current_period_end to date", { error: String(dateError) });
      }
      
      const priceId = subscription.items.data[0]?.price?.id;
      if (priceId === 'price_1Saae7JDrYaA8zu3ZPwQyUhc') {
        subscriptionPlan = 'weekly';
      } else if (priceId === 'price_1SaadvJDrYaA8zu34NVADeb3') {
        subscriptionPlan = 'monthly';
      } else {
        subscriptionPlan = 'premium';
      }
      
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd, plan: subscriptionPlan });
    } else {
      logStep("No active subscription found");
    }

    // Update profile with subscription status
    await supabaseAdmin
      .from('profiles')
      .update({ 
        has_active_subscription: hasActiveSub,
        subscription_status: hasActiveSub ? 'active' : 'free',
        subscription_end_date: subscriptionEnd,
        subscription_plan: subscriptionPlan,
        stripe_customer_id: customerId
      })
      .eq('id', user.id);

    logStep("Profile updated", { hasActiveSub, subscriptionEnd, subscriptionPlan });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_end: subscriptionEnd,
      subscription_plan: subscriptionPlan
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
