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
  existingLetterId?: string;
}

export const GenerationStep = ({
  cvPath,
  jobTitle,
  companyName,
  jobDescription,
  generatedLetter,
  setGeneratedLetter,
  onReset,
  existingLetterId,
}: GenerationStepProps) => {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // 🔹 Récupère le profil utilisateur dès qu'on a un user
  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone_number, professional_email, linkedin_url")
      .eq("id", user.id)
      .single();
    if (error) console.error("Error fetching profile:", error);
    else setProfileData(data);
  };

  // Appel de fetchProfile quand on génère la lettre
  const generateLetter = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      await fetchProfile();

      // Télécharger le CV
      const { data: cvData, error: downloadError } = await supabase.storage
        .from("cvs")
        .download(cvPath);
      if (downloadError) throw downloadError;

      const arrayBuffer = await cvData.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
        body: {
          jobTitle,
          companyName,
          jobDescription,
          cvPdfBase64: base64,
          profileInfo: profileData,
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

      if (existingLetterId) {
        // Mise à jour de la lettre existante
        const { error } = await supabase
          .from("cover_letters")
          .update({
            job_title: jobTitle,
            company_name: companyName,
            job_description: jobDescription,
            generated_letter: generatedLetter,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingLetterId);

        if (error) throw error;
      } else {
        // Création d'une nouvelle lettre
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
      }

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

  // 🧩 Génération du PDF avec en-tête dynamique
  const downloadLetter = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const leftMargin = 20;
      const rightMargin = 20;
      const topMargin = 25;
      const bottomMargin = 25;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - leftMargin - rightMargin;

      // Données du profil dynamique
      const name = profileData
        ? `${profileData.first_name?.toUpperCase() || ""} ${profileData.last_name?.toUpperCase() || ""}`
        : "NOM PRÉNOM";

      const subtitle = "Stage de 6 mois à partir de Février 2026";

      const contact = [
        profileData?.phone_number || "",
        profileData?.professional_email || "",
        profileData?.linkedin_url || "",
      ]
        .filter(Boolean)
        .join("  •  ");

      const title = `Stage – ${jobTitle} (${companyName})`;

      // --- EN-TÊTE ---
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(contact, pageWidth / 2, topMargin, { align: "center" });

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(name, pageWidth / 2, topMargin + 10, { align: "center" });

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, pageWidth / 2, topMargin + 17, { align: "center" });

      doc.setDrawColor(0);
      doc.line(leftMargin, topMargin + 22, pageWidth - leftMargin, topMargin + 22);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, topMargin + 32, { align: "center" });

      doc.setLineWidth(0.3);
      doc.line(leftMargin, topMargin + 34, pageWidth - leftMargin, topMargin + 34);

      // --- TEXTE DE LA LETTRE ---
      doc.setFont("Times", "Roman");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);

      const lines = doc.splitTextToSize(generatedLetter, maxWidth);
      let y = topMargin + 44;

      lines.forEach((line: string) => {
        if (y > pageHeight - bottomMargin) {
          doc.addPage();
          y = topMargin;
        }
        doc.text(line, leftMargin, y, { maxWidth });
        y += 6;
      });

      doc.save(`lettre_motivation_${companyName}_${Date.now()}.pdf`);

      toast({
        title: "Téléchargement réussi",
        description: "Votre lettre a été téléchargée avec l'en-tête personnalisé",
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
