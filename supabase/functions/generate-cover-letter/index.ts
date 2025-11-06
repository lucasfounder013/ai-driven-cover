import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, companyName, jobDescription, cvPdfBase64, profileInfo } = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    console.log("Generating cover letter...");

    const systemPrompt = `Tu es un expert en rédaction de lettres de motivation professionnelles en français. 
Tu dois créer des lettres personnalisées et structurées.
RÈGLES :
- Utilise UNIQUEMENT les informations du CV fourni
- N'invente AUCUNE compétence
- Si une info manque, n'en parle pas
- Sois factuel et précis
- Ton professionnel, adapté au poste`;

    // Préparer le contenu avec le PDF
    const content = [];
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

    // ✅✅ CORRECTION : compatibilité snake_case ↔ camelCase
    let headerText = "";
    if (profileInfo) {
      const firstName = profileInfo.firstName ?? profileInfo.first_name ?? "";
      const lastName = profileInfo.lastName ?? profileInfo.last_name ?? "";
      const phoneNumber = profileInfo.phoneNumber ?? profileInfo.phone_number ?? "";
      const professionalEmail = profileInfo.professionalEmail ?? profileInfo.professional_email ?? "";
      const linkedinUrl = profileInfo.linkedinUrl ?? profileInfo.linkedin_url ?? "";
      const desiredPosition = profileInfo.desiredPosition ?? profileInfo.desired_position ?? "";
      const durationMin = profileInfo.durationMin ?? profileInfo.duration_min ?? "";
      const durationMax = profileInfo.durationMax ?? profileInfo.duration_max ?? "";
      const availableFrom = profileInfo.availableFrom ?? profileInfo.available_from ?? "";

      const fullName = `${firstName} ${lastName}`.trim().toUpperCase();
      if (fullName) headerText += `${fullName}\n\n`;

      let subtitle = "";
      if (desiredPosition) subtitle += desiredPosition;
      if (durationMin && durationMax) subtitle += ` - de ${durationMin} à ${durationMax} mois`;
      else if (durationMin) subtitle += ` - ${durationMin} mois`;
      if (availableFrom) subtitle += ` - à partir de ${availableFrom}`;
      if (subtitle) headerText += `${subtitle}\n`;

      const contactParts = [];
      if (phoneNumber) contactParts.push(phoneNumber);
      if (professionalEmail) contactParts.push(professionalEmail);
      if (linkedinUrl) contactParts.push(linkedinUrl);
      if (contactParts.length > 0) {
        headerText += `${contactParts.join(" • ")}\n\n`;
      }

      if (jobTitle) headerText += `${jobTitle}\n\n`;
    }

    const textPrompt = `
Analyse le CV fourni et rédige une lettre de motivation professionnelle.

Poste : ${jobTitle}
Entreprise : ${companyName}
${jobDescription ? `Description du poste : ${jobDescription}` : ""}

IMPORTANT : Voici l'en-tête ajouté automatiquement (NE PAS LE RÉPÉTER) :
${headerText}

Règles :
1. Commence DIRECTEMENT par "Madame, Monsieur,"
2. N'inclus pas le nom du candidat ni ses coordonnées
3. Utilise uniquement des informations du CV
4. Longueur 300-400 mots
5. Ton professionnel et formel
`;

    content.push({
      type: "text",
      text: textPrompt,
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic error:", errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes dépassée." }), {
          status: 429,
          headers: corsHeaders,
        });
      }

      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants." }), {
          status: 402,
          headers: corsHeaders,
        });
      }

      throw new Error(`Erreur API Anthropic : ${response.status}`);
    }

    const data = await response.json();
    const generatedBody = data?.content?.[0]?.text ?? "";
    const generatedLetter = headerText + generatedBody;

    return new Response(JSON.stringify({ generatedLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
