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
    // 🔹 Récupération des données envoyées par le frontend
    const { jobTitle, companyName, jobDescription, cvPdfBase64, profileInfo } = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    console.log("🧠 Generating cover letter for:", jobTitle, "at", companyName);

    // === SYSTEM PROMPT ===
    const systemPrompt = `
Tu es un expert en rédaction de lettres de motivation professionnelles en français.
Tu écris des lettres naturelles, fluides, personnalisées, et sans répétition inutile.
RÈGLES :
- Utilise UNIQUEMENT les informations du CV fourni
- N'invente AUCUNE compétence
- Sois factuel, précis, fluide et professionnel
- Ne parle jamais de toi à la première personne (tu écris au nom du candidat)
- N'inclus JAMAIS le nom, email, téléphone ou coordonnées du candidat
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
Rédige le corps complet d'une lettre de motivation professionnelle pour un poste.

Contexte :
- Poste : ${jobTitle}
- Entreprise : ${companyName}
${jobDescription ? `- Description de l'offre : ${jobDescription}` : ""}
- Les informations personnelles du candidat (nom, téléphone, email, etc.) sont déjà ajoutées ailleurs dans l'application.

Règles STRICTES :
1️⃣ Commence directement par "Madame, Monsieur,".
2️⃣ N'ajoute AUCUNE information d'en-tête (nom, contact, titre, entreprise, etc.).
3️⃣ Ne signe PAS la lettre (pas de "Cordialement" ni de nom).
4️⃣ Écris un texte fluide, clair et professionnel.
5️⃣ Longueur recommandée : entre 300 et 400 mots.
6️⃣ Sois cohérent avec les expériences et la formation visibles dans le CV fourni.

Structure recommandée :
- Introduction (motivation + lien avec le poste)
- Développement (expériences, compétences pertinentes)
- Conclusion (intérêt, ouverture à un entretien)
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
    const generatedLetter = data?.content?.[0]?.text ?? "";

    // === EMAILS DE CANDIDATURE ET DE RELANCE ===
    const firstName = profileInfo?.firstName ?? profileInfo?.first_name ?? "";
    const lastName = profileInfo?.lastName ?? profileInfo?.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    // Email de candidature
    const applicationEmailPrompt = `
Rédige un email professionnel très court et concis en français pour postuler au poste de "${jobTitle}" chez ${companyName}.

Contraintes :
- 80 à 100 mots maximum
- Objet d'email accrocheur
- Mentionne la lettre de motivation et le CV en pièces jointes
- Forme polie, claire et professionnelle
- Termine par "Cordialement, ${fullName}"
`;

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

    // Email de relance
    const followupEmailPrompt = `
Rédige un email de relance professionnel et poli pour le poste de "${jobTitle}" chez ${companyName}.

Contraintes :
- 60 à 80 mots
- Rappelle la candidature avec tact
- Montre un intérêt sincère pour le poste
- Termine par "Cordialement, ${fullName}"
`;

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
