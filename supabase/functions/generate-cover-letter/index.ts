import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, companyName, jobDescription, cvPdfBase64, profileInfo } = await req.json();
    
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    console.log('Analyzing CV and generating cover letter with Claude...');

    const systemPrompt = `Tu es un expert en rédaction de lettres de motivation professionnelles en français. 
Tu dois créer des lettres personnalisées, convaincantes et bien structurées qui mettent en valeur les compétences du candidat.

RÈGLES CRITIQUES :
- Utilise UNIQUEMENT les informations présentes dans le CV fourni
- N'invente AUCUNE compétence, expérience ou formation qui n'est pas explicitement mentionnée dans le CV
- Si une information manque dans le CV, ne la mentionne pas dans la lettre
- Sois factuel et précis, en citant des éléments concrets du CV
- La lettre doit être formelle, professionnelle et adaptée au poste et à l'entreprise`;

    // Préparer le contenu avec le PDF du CV
    const content = [];
    
    if (cvPdfBase64) {
      content.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: cvPdfBase64
        }
      });
    }

    // Construire l'en-tête avec les informations du profil
    let headerText = '';
    if (profileInfo) {
      const { firstName, lastName, phoneNumber, professionalEmail, linkedinUrl, desiredPosition, durationMin, durationMax, availableFrom } = profileInfo;
      
      // Nom en majuscules et gras (centré)
      const fullName = `${firstName || ''} ${lastName || ''}`.trim().toUpperCase();
      headerText = `${fullName}\n\n`;
      
      // Sous-titre avec type de poste, durée et date de début
      let subtitle = '';
      if (desiredPosition) subtitle += desiredPosition;
      if (durationMin && durationMax) {
        subtitle += ` - de ${durationMin} à ${durationMax} mois`;
      } else if (durationMin) {
        subtitle += ` - ${durationMin} mois`;
      }
      if (availableFrom) {
        subtitle += ` - à partir de ${availableFrom}`;
      }
      if (subtitle) headerText += `${subtitle}\n`;
      
      // Coordonnées sur une ligne avec séparateurs •
      const contactParts = [];
      if (phoneNumber) contactParts.push(phoneNumber);
      if (professionalEmail) contactParts.push(professionalEmail);
      if (linkedinUrl) contactParts.push(linkedinUrl);
      if (contactParts.length > 0) {
        headerText += `${contactParts.join(' • ')}\n\n`;
      }
      
      // Intitulé du poste en gras souligné
      headerText += `**${jobTitle}**\n\n`;
    }

    const textPrompt = `Analyse le CV fourni et rédige une lettre de motivation professionnelle pour le poste suivant :

Poste : ${jobTitle}
Entreprise : ${companyName}
${jobDescription ? `Description du poste : ${jobDescription}` : ''}

IMPORTANT : Voici l'en-tête qui sera ajouté automatiquement (NE LE RÉPÈTE PAS dans ta réponse) :
${headerText}

Instructions CRITIQUES :
1. NE COMMENCE PAS par l'en-tête, il sera ajouté automatiquement
2. Commence DIRECTEMENT par "Madame, Monsieur," (ou l'équivalent approprié)
3. N'inclus PAS le nom du candidat, ni ses coordonnées, ni le titre du poste au début de ta réponse
4. Lis attentivement le CV pour identifier les compétences, expériences et formations pertinentes
5. Structure le corps de la lettre avec :
   - Salutation : "Madame, Monsieur,"
   - Introduction mentionnant le poste et l'entreprise
   - Corps qui met en valeur les expériences et compétences RÉELLES du candidat
   - Conclusion professionnelle avec formule de politesse
6. Utilise UNIQUEMENT les informations du CV - n'invente rien
7. Sois concis et percutant (environ 300-400 mots)
8. Ton professionnel et formel

Rappel : L'en-tête avec le nom, coordonnées et titre est déjà présent, commence directement par la salutation.`;

    content.push({
      type: 'text',
      text: textPrompt
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          { role: 'user', content }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes dépassée. Veuillez réessayer dans quelques instants.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants. Veuillez ajouter des crédits à votre compte.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedBody = data.content[0].text;
    
    // Combiner l'en-tête avec le corps généré
    const generatedLetter = headerText + generatedBody;

    // Générer le mail de candidature
    console.log('Generating application email with Claude...');
    
    const candidateName = profileInfo ? `${profileInfo.firstName || ''} ${profileInfo.lastName || ''}`.trim().toUpperCase() : '[Votre prénom NOM]';
    const candidatePhone = profileInfo?.phoneNumber || '[Votre téléphone]';
    const candidateEmail = profileInfo?.professionalEmail || '[Votre email]';
    
    const applicationEmailPrompt = `En te basant sur les informations suivantes, génère un email professionnel et concis pour postuler au poste de ${jobTitle} chez ${companyName}.

Informations du candidat :
- Nom complet : ${candidateName}
- Téléphone : ${candidatePhone}
- Email : ${candidateEmail}

Instructions :
- Commence par "Objet : Candidature pour le poste de ${jobTitle}"
- Email court (5-8 lignes maximum)
- Ton professionnel et enthousiaste
- Mentionne que le CV et la lettre de motivation sont en pièce jointe
- Inclus OBLIGATOIREMENT la signature avec le nom complet, téléphone et email du candidat
- Termine par une formule de politesse`;

    const emailResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: applicationEmailPrompt }
        ],
      }),
    });

    const emailData = await emailResponse.json();
    const applicationEmail = emailData.content[0].text;

    // Générer le mail de relance
    console.log('Generating follow-up email with Claude...');
    const followupEmailPrompt = `Génère un email de relance professionnel pour le poste de ${jobTitle} chez ${companyName}, à envoyer 7-10 jours après la candidature initiale.

Informations du candidat :
- Nom complet : ${candidateName}
- Téléphone : ${candidatePhone}
- Email : ${candidateEmail}

Instructions :
- Commence par "Objet : Relance - Candidature ${jobTitle}"
- Email court et poli (5-7 lignes)
- Rappelle brièvement la candidature
- Exprime l'intérêt toujours présent pour le poste
- Demande des nouvelles du processus de recrutement
- Inclus OBLIGATOIREMENT la signature avec le nom complet, téléphone et email du candidat
- Ton courtois et professionnel, sans être insistant`;

    const followupResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: followupEmailPrompt }
        ],
      }),
    });

    const followupData = await followupResponse.json();
    const followupEmail = followupData.content[0].text;

    return new Response(
      JSON.stringify({ 
        generatedLetter,
        applicationEmail,
        followupEmail
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-cover-letter function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la génération.';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
