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
    <h1 style="font-size:22px;color:#1e2040;margin:0 0 24px;">"J'ai décroché 3 entretiens en deux semaines"</h1>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 16px;">Bonjour ${firstName},</p>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 16px;">Deux semaines. C'est le temps qu'il faut souvent pour voir les premiers résultats d'une recherche d'emploi bien organisée.</p>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 12px;">Les candidats qui utilisent JobBoost régulièrement remarquent deux choses :</p>
    <div style="background:#f0f1f8;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="font-size:14px;color:#1e2040;line-height:2;margin:0;">• Ils postulent plus — parce que ça prend moins de temps<br/>• Ils obtiennent plus de retours — parce que leurs candidatures sont mieux ciblées</p>
    </div>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 16px;">La recherche d'emploi, c'est un jeu de volume et de qualité. JobBoost vous aide sur les deux fronts.</p>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 16px;">Si vous avez déjà envoyé des candidatures, c'est peut-être le bon moment pour relancer celles qui n'ont pas encore répondu. Le générateur de relance est là pour ça — poli, professionnel, sans pression.</p>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 24px;">Et si vous cherchez encore votre rythme, pas de jugement. On est là pour la durée.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://ai-driven-cover.lovable.app/dashboard" style="display:inline-block;background:#1e2040;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">Accéder à JobBoost</a>
    </div>
    <p style="font-size:15px;color:#3a3d5c;line-height:1.7;margin:0 0 8px;">Bon courage pour la suite,<br/><strong>L'équipe JobBoost</strong></p>
    <p style="font-size:13px;color:#7a7d9c;line-height:1.6;margin:16px 0 0;font-style:italic;">P.S. — Vous avez une question, un retour, une suggestion ? On répond toujours aux emails.</p>
  </div>
  <p style="text-align:center;font-size:12px;color:#999;margin-top:24px;">© ${new Date().getFullYear()} JobBoost. Tous droits réservés.</p>
</div>
</body>
</html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: users, error } = await supabase
      .from("email_sequence")
      .select("*")
      .eq("j7_sent", true)
      .eq("j14_sent", false)
      .lte("created_at", fourteenDaysAgo);

    if (error) throw error;

    for (const user of users || []) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "L'équipe JobBoost <contact@jobboost.fr>",
          to: [user.email],
          subject: "\"J'ai décroché 3 entretiens en deux semaines\" — voilà comment",
          html: generateEmailHtml(user.first_name || ""),
        }),
      });

      if (res.ok) {
        await supabase.from("email_sequence").update({ j14_sent: true }).eq("id", user.id);
      } else {
        console.error(`Failed to send J14 email to ${user.email}:`, await res.text());
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error in send-email-j14:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
