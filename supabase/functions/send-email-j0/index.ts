import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const generateEmailHtml = (firstName: string) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:700;color:#1e2040;">🚀 JobBoost</span>
    </div>
    <h1 style="font-size:22px;color:#1e2040;margin:0 0 24px;">Bienvenue sur JobBoost, ${firstName} !</h1>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 16px;">Vous venez de créer votre compte sur JobBoost — bonne décision.</p>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 16px;">Trouver un emploi prend du temps. Rédiger des lettres de motivation, personnaliser chaque candidature, relancer les recruteurs sans paraître insistant... c'est épuisant. Et pourtant, c'est souvent là que tout se joue.</p>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 16px;font-weight:600;">JobBoost s'occupe de tout ça à votre place.</p>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 8px;">En quelques secondes, vous pouvez générer :</p>
    <div style="background:#f0f1f8;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="font-size:14px;color:#1e2040;line-height:1.8;margin:0;">→ Une lettre de motivation personnalisée à l'offre<br/>→ Un email de candidature percutant<br/>→ Un email de relance au bon moment</p>
    </div>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 24px;">Et toutes vos candidatures sont centralisées au même endroit, pour ne plus jamais perdre le fil.</p>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 24px;">Pour commencer, il suffit de coller une offre d'emploi et de laisser JobBoost faire le reste.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://ai-driven-cover.lovable.app/dashboard" style="display:inline-block;background:#1e2040;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">Commencer maintenant</a>
    </div>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0;">À très vite,<br/><strong>L'équipe JobBoost</strong></p>
  </div>
  <p style="text-align:center;font-size:12px;color:#999;margin-top:24px;">© ${new Date().getFullYear()} JobBoost. Tous droits réservés.</p>
</div>
</body>
</html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get users where j0 not sent
    const { data: users, error } = await supabase
      .from("email_sequence")
      .select("*")
      .eq("j0_sent", false);

    if (error) throw error;

    for (const user of users || []) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "L'équipe JobBoost <contact@jobboost.fr>",
          to: [user.email],
          subject: "Bienvenue sur JobBoost — votre recherche d'emploi change de vitesse",
          html: generateEmailHtml(user.first_name || ""),
        }),
      });

      if (res.ok) {
        await supabase.from("email_sequence").update({ j0_sent: true }).eq("id", user.id);
      } else {
        console.error(`Failed to send J0 email to ${user.email}:`, await res.text());
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error in send-email-j0:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
