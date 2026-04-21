import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_GENERATION_LIMIT = 5;

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-COVER-LETTER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check subscription status
    let hasActiveSubscription = false;
    
    // First check from profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('has_active_subscription, total_generations_count')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      logStep("Error fetching profile", { error: profileError.message });
    }

    const currentGenerations = profile?.total_generations_count ?? 0;
    hasActiveSubscription = profile?.has_active_subscription ?? false;

    // Double-check with Stripe if not subscribed (in case webhook missed)
    if (!hasActiveSubscription && user.email) {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        try {
          const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
          const customers = await stripe.customers.list({ email: user.email, limit: 1 });
          
          if (customers.data.length > 0) {
            const subscriptions = await stripe.subscriptions.list({
              customer: customers.data[0].id,
              status: "active",
              limit: 1,
            });
            
            if (subscriptions.data.length > 0) {
              hasActiveSubscription = true;
              // Update profile
              await supabaseClient
                .from('profiles')
                .update({ has_active_subscription: true })
                .eq('id', user.id);
              logStep("Stripe subscription found and profile updated");
            }
          }
        } catch (stripeError) {
          logStep("Stripe check error (non-blocking)", { error: stripeError });
        }
      }
    }

    logStep("Subscription check complete", { hasActiveSubscription, currentGenerations });

    // Check quota for free users
    if (!hasActiveSubscription && currentGenerations >= FREE_GENERATION_LIMIT) {
      logStep("Free limit reached", { currentGenerations, limit: FREE_GENERATION_LIMIT });
      return new Response(
        JSON.stringify({ error: "FREE_LIMIT_REACHED" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 🔹 Récupération des données envoyées par le frontend
    const { jobTitle, companyName, jobDescription, cvPdfBase64, profileInfo } = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    logStep("Generating cover letter", { jobTitle, companyName });

    // === SYSTEM PROMPT ===
    const systemPrompt = `
Tu es un expert en rédaction de lettres de motivation professionnelles en français.
Tu écris des lettres naturelles, fluides, personnalisées, et sans répétition inutile.
RÈGLES ABSOLUES :
- Utilise UNIQUEMENT et EXCLUSIVEMENT les informations du CV fourni
- N'INVENTE AUCUNE information : ni expérience, ni compétence, ni formation, ni projet
- Si une information n'est pas dans le CV, ne la mentionne PAS
- Sois factuel, précis, fluide et professionnel
- Ne parle jamais de toi à la première personne (tu écris au nom du candidat)
- N'inclus JAMAIS le nom, email, téléphone ou coordonnées du candidat dans l'en-tête
- TOUJOURS terminer la lettre par une formule de politesse professionnelle
`;

    // === Préparation du contenu envoyé à Claude ===
    const content: any[] = [];

    // Inclure le CV en base64
    if (cvPdfBase64) {
      content.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: cvPdfBase64,
        },
      });
    }

    // === PROMPT PRINCIPAL ===
    const textPrompt = `
Rédige UNIQUEMENT le corps d'une lettre de motivation professionnelle pour un poste.

Contexte :
- Poste : ${jobTitle}
- Entreprise : ${companyName}
${jobDescription ? `- Description de l'offre : ${jobDescription}` : ""}

Règles STRICTES :
1️⃣ Commence directement par "Madame, Monsieur,".
2️⃣ N'ajoute AUCUNE information d'en-tête : NI le nom du candidat, NI ses coordonnées, NI le titre du poste, NI le nom de l'entreprise en haut de la lettre.
3️⃣ Termine OBLIGATOIREMENT par une formule de politesse professionnelle (ex: "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées." ou "Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, mes salutations respectueuses.").
4️⃣ N'INVENTE AUCUNE information : utilise UNIQUEMENT ce qui est dans le CV fourni.
5️⃣ Écris un texte fluide, clair et professionnel.
6️⃣ Longueur OBLIGATOIRE : entre 210 et 250 mots maximum.
7️⃣ Sois synthétique tout en restant professionnel et précis.

Structure OBLIGATOIRE (3 paragraphes maximum) :
- Paragraphe 1 : Introduction courte (motivation + lien avec le poste)
- Paragraphe 2 : Développement concis (1-2 expériences ou compétences les plus pertinentes)
- Paragraphe 3 : Conclusion brève (intérêt + ouverture à un entretien)

Chaque paragraphe doit être fluide et naturel, sans redondance.
`;

    content.push({
      type: "text",
      text: textPrompt,
    });

    // === Appel à l'API Anthropic ===
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("Anthropic API error (cover letter)", { status: response.status, body: errorText });
      throw new Error(`Erreur API Anthropic (lettre) : ${response.status} — ${errorText}`);
    }

    const data = await response.json();
    const generatedLetter = data?.content?.[0]?.text ?? "";

    // === EMAILS DE CANDIDATURE ET DE RELANCE ===
    const firstName = profileInfo?.firstName ?? profileInfo?.first_name ?? "";
    const lastName = profileInfo?.lastName ?? profileInfo?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    // Email de candidature - avec CV
    const applicationEmailContent: any[] = [];
    
    if (cvPdfBase64) {
      applicationEmailContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: cvPdfBase64,
        },
      });
    }

    const applicationEmailPrompt = `
Rédige un email professionnel très court et concis en français pour postuler au poste de "${jobTitle}" chez ${companyName}.

IMPORTANT : Utilise les informations du CV fourni pour personnaliser l'email de manière pertinente.
${jobDescription ? `Description du poste : ${jobDescription}` : ""}

Contraintes :
- 80 à 100 mots maximum
- Objet d'email accrocheur
- Mentionne brièvement 1-2 compétences/expériences clés du CV pertinentes pour le poste
- Mentionne la lettre de motivation et le CV en pièces jointes
- Forme polie, claire et professionnelle
- Termine par "Cordialement, ${fullName}"
`;

    applicationEmailContent.push({
      type: "text",
      text: applicationEmailPrompt,
    });

    const applicationEmailResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: applicationEmailContent }],
      }),
    });

    if (!applicationEmailResponse.ok) {
      const errorText = await applicationEmailResponse.text();
      logStep("Anthropic API error (application email)", { status: applicationEmailResponse.status, body: errorText });
    }
    const applicationEmailData = await applicationEmailResponse.json().catch(() => ({}));
    const applicationEmail = applicationEmailData?.content?.[0]?.text ?? "";

    // Email de relance - avec CV
    const followupEmailContent: any[] = [];
    
    if (cvPdfBase64) {
      followupEmailContent.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: cvPdfBase64,
        },
      });
    }

    const followupEmailPrompt = `
Rédige un email de relance professionnel et poli pour le poste de "${jobTitle}" chez ${companyName}.

IMPORTANT : Utilise les informations du CV fourni pour rappeler subtilement ta valeur ajoutée.
${jobDescription ? `Description du poste : ${jobDescription}` : ""}

Contraintes :
- 60 à 80 mots
- Rappelle la candidature avec tact
- Mentionne brièvement 1 compétence/expérience clé du CV alignée avec le poste
- Montre un intérêt sincère pour le poste
- Termine par "Cordialement, ${fullName}"
`;

    followupEmailContent.push({
      type: "text",
      text: followupEmailPrompt,
    });

    const followupEmailResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: followupEmailContent }],
      }),
    });

    if (!followupEmailResponse.ok) {
      const errorText = await followupEmailResponse.text();
      logStep("Anthropic API error (followup email)", { status: followupEmailResponse.status, body: errorText });
    }
    const followupEmailData = await followupEmailResponse.json().catch(() => ({}));
    const followupEmail = followupEmailData?.content?.[0]?.text ?? "";

    // Increment generation count for free users
    if (!hasActiveSubscription) {
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ total_generations_count: currentGenerations + 1 })
        .eq('id', user.id);
      
      if (updateError) {
        logStep("Error updating generation count", { error: updateError.message });
      } else {
        logStep("Generation count incremented", { newCount: currentGenerations + 1 });
      }
    }

    // === RÉPONSE ===
    return new Response(
      JSON.stringify({
        generatedLetter,
        applicationEmail,
        followupEmail,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});