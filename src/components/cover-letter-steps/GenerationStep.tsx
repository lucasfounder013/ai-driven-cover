import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Sparkles, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GenerationStepProps {
  cvPath: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  generatedLetter: string;
  setGeneratedLetter: (letter: string) => void;
  onReset: () => void;
}

export const GenerationStep = ({
  cvPath,
  jobTitle,
  companyName,
  jobDescription,
  generatedLetter,
  setGeneratedLetter,
  onReset,
}: GenerationStepProps) => {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateLetter = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone_number, professional_email, linkedin_url, desired_position, duration_min, duration_max, available_from")
        .eq("id", user.id)
        .single();

      const { data: cvData } = await supabase.storage
        .from("cvs")
        .download(cvPath);

      const arrayBuffer = await cvData.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const profileInfo = profileData ? {
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        phoneNumber: profileData.phone_number || '',
        professionalEmail: profileData.professional_email || '',
        linkedinUrl: profileData.linkedin_url || '',
        desiredPosition: profileData.desired_position || '',
        durationMin: profileData.duration_min || null,
        durationMax: profileData.duration_max || null,
        availableFrom: profileData.available_from || ''
      } : null;

      const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
        body: {
          jobTitle,
          companyName,
          jobDescription,
          cvPdfBase64: base64,
          profileInfo,
        },
      });

      if (error) throw error;
      setGeneratedLetter(data.generatedLetter);

      toast({
        title: "Lettre générée",
        description: "Votre lettre de motivation a été créée avec succès",
      });
    } catch (error: any) {
      console.error("Error generating letter:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer la lettre",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveLetter = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session invalide");

      const { error } = await supabase.from("cover_letters").insert({
        user_id: session.user.id,
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
        cv_text: cvPath,
        generated_letter: generatedLetter,
        status: "final",
      });

      if (error) throw error;

      toast({
        title: "Lettre sauvegardée",
        description: "Votre lettre a été enregistrée avec succès",
      });
      onReset();
    } catch (error: any) {
      console.error("Error saving letter:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la lettre",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadLetter = async () => {
    if (!user) return;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      // Récupérer les infos du profil pour l'en-tête
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone_number, professional_email, linkedin_url, desired_position, duration_min, duration_max, available_from")
        .eq("id", user.id)
        .single();

      // Marges
      const leftMargin = 20;
      const rightMargin = 20;
      const topMargin = 25;
      const bottomMargin = 25;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - leftMargin - rightMargin;

      let yPos = topMargin;

      // --- EN-TÊTE ---
      if (profileData) {
        // Nom en majuscules et gras (centré)
        const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim().toUpperCase();
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16);
        doc.text(fullName, pageWidth / 2, yPos, { align: "center" });
        yPos += 8;

        // Sous-titre avec type de poste, durée et date de début
        let subtitle = '';
        if (profileData.desired_position) subtitle += profileData.desired_position;
        if (profileData.duration_min && profileData.duration_max) {
          subtitle += ` - de ${profileData.duration_min} à ${profileData.duration_max} mois`;
        } else if (profileData.duration_min) {
          subtitle += ` - ${profileData.duration_min} mois`;
        }
        if (profileData.available_from) {
          subtitle += ` - à partir de ${profileData.available_from}`;
        }
        
        if (subtitle) {
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          doc.text(subtitle, pageWidth / 2, yPos, { align: "center" });
          yPos += 6;
        }

        // Coordonnées sur une ligne avec séparateurs •
        const contactParts = [];
        if (profileData.phone_number) contactParts.push(profileData.phone_number);
        if (profileData.professional_email) contactParts.push(profileData.professional_email);
        if (profileData.linkedin_url) contactParts.push(profileData.linkedin_url);
        
        if (contactParts.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          doc.text(contactParts.join(' • '), pageWidth / 2, yPos, { align: "center" });
          yPos += 10;
        }

        // Ligne de séparation
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(leftMargin, yPos, pageWidth - rightMargin, yPos);
        yPos += 8;

        // Intitulé du poste en gras souligné
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text(jobTitle, pageWidth / 2, yPos, { align: "center" });
        
        // Souligner le titre
        const titleWidth = doc.getTextWidth(jobTitle);
        doc.line(
          (pageWidth - titleWidth) / 2,
          yPos + 1,
          (pageWidth + titleWidth) / 2,
          yPos + 1
        );
        yPos += 12;
      }

      // --- TEXTE DE LA LETTRE ---
      doc.setFont("Times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);

      // Le corps de la lettre commence après l'en-tête dans generatedLetter
      // On cherche où commence le corps (après l'en-tête formaté)
      let letterBody = generatedLetter;
      
      // Retirer l'en-tête si présent (les lignes avec nom, coordonnées, titre)
      const lines = letterBody.split('\n');
      let bodyStartIndex = 0;
      
      // Chercher "Madame, Monsieur" ou une formule de politesse similaire
      for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const line = lines[i].trim();
        if (line.includes('Madame') || line.includes('Monsieur') || 
            line.includes('À l\'attention') || line.includes('Objet :')) {
          bodyStartIndex = i;
          break;
        }
      }
      
      letterBody = lines.slice(bodyStartIndex).join('\n').trim();
      const textLines = doc.splitTextToSize(letterBody, maxWidth);
      
      textLines.forEach((line: string) => {
        if (yPos > pageHeight - bottomMargin) {
          doc.addPage();
          yPos = topMargin;
        }
        doc.text(line, leftMargin, yPos);
        yPos += 6;
      });

      doc.save(`Lettre_${companyName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);

      toast({
        title: "Téléchargement réussi",
        description: "Votre lettre a été téléchargée avec l'en-tête formaté",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la lettre",
        variant: "destructive",
      });
    }
  };

  const copyLetter = () => {
    navigator.clipboard
      .writeText(generatedLetter)
      .then(() => {
        setCopied(true);
        toast({
          title: "Lettre copiée",
          description: "La lettre a été copiée dans le presse-papier",
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Error copying letter:", error);
        toast({
          title: "Erreur",
          description: "Impossible de copier la lettre",
          variant: "destructive",
        });
      });
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <h3 className="text-xl font-semibold text-foreground">
          Génération en cours...
        </h3>
        <p className="text-muted-foreground">
          Rédaction de votre lettre en cours
        </p>
      </div>
    );
  }

  if (!generatedLetter) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Sparkles className="w-20 h-20 text-primary" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Prêt à générer votre lettre de motivation
          </h2>
          <p className="text-muted-foreground">
            Cliquez sur le bouton ci-dessous pour lancer la génération
          </p>
        </div>
        <Button onClick={generateLetter} size="lg" className="mt-4">
          <Sparkles className="w-5 h-5 mr-2" />
          Générer ma lettre
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Votre lettre de motivation
        </h2>
        <p className="text-muted-foreground">
          Vous pouvez modifier le texte avant de l'enregistrer
        </p>
      </div>

      <Textarea
        value={generatedLetter}
        onChange={(e) => setGeneratedLetter(e.target.value)}
        className="min-h-[400px] font-serif"
      />

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={copyLetter} variant="outline">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copier
            </>
          )}
        </Button>
        <Button onClick={downloadLetter} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </Button>
        <Button onClick={saveLetter} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            "Sauvegarder"
          )}
        </Button>
      </div>
    </div>
  );
};