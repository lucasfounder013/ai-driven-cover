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
    const { jobTitle, companyName, jobDescription, cvText } = await req.json();
    
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const systemPrompt = `Tu es un expert en rédaction de lettres de motivation professionnelles en français. 
Tu dois créer des lettres personnalisées, convaincantes et bien structurées qui mettent en valeur les compétences du candidat.
La lettre doit être formelle, professionnelle et adaptée au poste et à l'entreprise.`;

    const userPrompt = `Rédige une lettre de motivation professionnelle pour le poste suivant :

Poste : ${jobTitle}
Entreprise : ${companyName}
${jobDescription ? `Description du poste : ${jobDescription}` : ''}

${cvText ? `Informations du CV du candidat :
${cvText}` : ''}

La lettre doit :
- Être structurée avec une introduction, un corps de texte et une conclusion
- Mettre en valeur les compétences pertinentes du candidat
- Montrer l'intérêt du candidat pour l'entreprise et le poste
- Être concise et percutante (environ 300-400 mots)
- Utiliser un ton professionnel et formel`;

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
          { role: 'user', content: userPrompt }
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
    const generatedLetter = data.content[0].text;

    return new Response(
      JSON.stringify({ generatedLetter }),
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
