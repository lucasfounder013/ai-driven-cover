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
- Sois factuel, précis, fluide et professionnel.`;

    const content: any[] = [];

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

    // === Construire le header unique ===
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

      // 🧭 Date formatée en français
      let startDateText = "";
      if (availableFrom) {
        try {
          const date = new Date(availableFrom);
          startDateText = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
          startDateText = startDateText.charAt(0).toUpperCase() + startDateText.slice(1);
        } catch {
          startDateText = availableFrom;
        }
      }

      let subtitle = "";
      if (desiredPosition) subtitle += desiredPosition;
      if (durationMin && durationMax) subtitle += ` - de ${durationMin} à ${durationMax} mois`;
      else if (durationMin) subtitle += ` - ${durationMin} mois`;
      if (startDateText) subtitle += ` - à partir de ${startDateText}`;
      if (subtitle) headerText += `${subtitle}\n`;

      const contactParts = [];
      if (phoneNumber) contactParts.push(phoneNumber);
      if (professionalEmail) contactParts.push(professionalEmail);
      if (linkedinUrl) contactParts.push(linkedinUrl);
      if (contactParts.length > 0) {
        headerText += `${contactParts.join(" • ")}\n\n`;
      }

      if (jobTitle) headerText += `Stage – ${jobTitle} (${companyName})\n\n`;
    }

    // === Nouveau prompt ultra précis ===
    const textPrompt = `
Rédige le corps d'une lettre de motivation professionnelle et naturelle pour le poste suivant :

Poste : ${jobTitle}
Entreprise : ${companyName}
${jobDescription ? `Description de l'offre : ${jobDescription}` : ""}

Ne répète pas les informations suivantes (elles seront affichées ailleurs) :
${headerText}

Règles STRICTES :
1️⃣ Commence directement par "Madame, Monsieur,".
2️⃣ N'ajoute AUCUNE information d'en-tête (nom, téléphone, email, poste, etc.).
3️⃣ Ne signe pas la lettre (pas de "Cordialement" ou de nom à la fin).
4️⃣ Sois fluide, professionnel et cohérent avec le CV.
5️⃣ Fais entre 300 et 400 mots maximum.

Structure claire : 3 à 4 paragraphes.
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
      throw new Error(`Erreur API Anthropic : ${response.status}`);
    }

    const data = await response.json();
    const generatedBody = data?.content?.[0]?.text ?? "";
    const generatedLetter = headerText + generatedBody;

    // === Génération email de candidature ===
    const firstName = profileInfo?.firstName ?? profileInfo?.first_name ?? "";
    const lastName = profileInfo?.lastName ?? profileInfo?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    const applicationEmailPrompt = `Rédige un email professionnel très court et concis en français pour postuler au poste de "${jobTitle}" chez ${companyName}.
- 80 à 100 mots
- Objet accrocheur
- Mentionne lettre de motivation et CV en pièces jointes
- Termine par "Cordialement, ${fullName}"`;

    const applicationEmailResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: applicationEmailPrompt }],
      }),
    });

    const applicationEmailData = await applicationEmailResponse.json();
    const applicationEmail = applicationEmailData?.content?.[0]?.text ?? "";

    // === Génération email de relance ===
    const followupEmailPrompt = `Rédige un email de relance professionnel et poli pour le poste de "${jobTitle}" chez ${companyName}.
- 60 à 80 mots
- Rappelle la candidature avec tact
- Montre l'intérêt pour le poste
- Termine par "Cordialement, ${fullName}"`;

    const followupEmailResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: followupEmailPrompt }],
      }),
    });

    const followupEmailData = await followupEmailResponse.json();
    const followupEmail = followupEmailData?.content?.[0]?.text ?? "";

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
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
