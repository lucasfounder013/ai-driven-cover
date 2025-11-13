import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Sparkles, Copy, Check, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LetterPreview } from "./LetterPreview";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GenerationStepProps {
  cvPath: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  generatedLetter: string;
  setGeneratedLetter: (letter: string) => void;
  onReset: () => void;
  onSave?: () => void;
  existingLetterId?: string;
  existingProfileData?: any;
}

interface EmailsData {
  applicationEmail: string;
  followupEmail: string;
}

export const GenerationStep = ({
  cvPath,
  jobTitle,
  companyName,
  jobDescription,
  generatedLetter,
  setGeneratedLetter,
  onReset,
  onSave,
  existingLetterId,
  existingProfileData,
}: GenerationStepProps) => {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState<any>(existingProfileData || null);
  const [emails, setEmails] = useState<EmailsData>({
    applicationEmail: "",
    followupEmail: "",
  });
  const [editHeaderOpen, setEditHeaderOpen] = useState(false);
  const [editedProfileData, setEditedProfileData] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🧠 Génération automatique via Supabase Edge Function
  const generateLetter = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "first_name, last_name, phone_number, professional_email, linkedin_url, desired_position, duration_min, duration_max, available_from",
        )
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfileData(profile);

      const { data: cvData, error: downloadError } = await supabase.storage.from("cvs").download(cvPath);
      if (downloadError) throw downloadError;

      const arrayBuffer = await cvData.arrayBuffer();
      const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));

      const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
        body: {
          jobTitle,
          companyName,
          jobDescription,
          cvPdfBase64: base64,
          profileInfo: profile,
        },
      });

      if (error) throw error;

      setGeneratedLetter(data.generatedLetter);
      setEmails({
        applicationEmail: data.applicationEmail || "",
        followupEmail: data.followupEmail || "",
      });

      toast({
        title: "Lettre générée",
        description: "Votre lettre de motivation et les emails ont été créés avec succès.",
      });
    } catch (error: any) {
      console.error("Error generating letter:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer la lettre de motivation.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  // 💾 Sauvegarde dans Supabase
  const saveLetter = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Session invalide");

      if (existingLetterId) {
        const { error } = await supabase
          .from("cover_letters")
          .update({
            job_title: jobTitle,
            company_name: companyName,
            job_description: jobDescription,
            generated_letter: generatedLetter,
            application_email: emails.applicationEmail,
            followup_email: emails.followupEmail,
            profile_data: profileData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingLetterId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("cover_letters").insert({
          user_id: session.user.id,
          job_title: jobTitle,
          company_name: companyName,
          job_description: jobDescription,
          cv_text: cvPath,
          generated_letter: generatedLetter,
          application_email: emails.applicationEmail,
          followup_email: emails.followupEmail,
          profile_data: profileData,
          status: "final",
        });

        if (error) throw error;
      }

      toast({
        title: "Lettre sauvegardée",
        description: "Votre lettre de motivation a été enregistrée avec succès.",
      });
      
      if (onSave) {
        onSave();
      } else {
        onReset();
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Error saving letter:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la lettre de motivation.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 📄 Téléchargement PDF (format professionnel français)
  const downloadLetter = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });

      const leftMargin = 20;
      const topMargin = 25;
      const bottomMargin = 25;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - 2 * leftMargin;

      const name = `${profileData?.first_name?.toUpperCase() || "NOM"} ${
        profileData?.last_name?.toUpperCase() || "PRÉNOM"
      }`;
      
      // Construire le sous-titre dynamiquement à partir du profil
      const durationMin = profileData?.duration_min;
      const durationMax = profileData?.duration_max;
      const availableFrom = profileData?.available_from;
      
      let durationText = "";
      if (durationMin && durationMax) {
        if (durationMin === durationMax) {
          durationText = `${durationMin} mois`;
        } else {
          durationText = `${durationMin} à ${durationMax} mois`;
        }
      } else if (durationMin) {
        durationText = `${durationMin} mois`;
      }
      
      // Formater la date au format français
      let formattedDate = "";
      if (availableFrom) {
        try {
          const date = new Date(availableFrom);
          formattedDate = format(date, "MMMM yyyy", { locale: fr });
          // Capitaliser la première lettre
          formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        } catch (e) {
          formattedDate = availableFrom;
        }
      }
      
      const subtitle = `${profileData?.desired_position || "Stage"}${durationText ? ` de ${durationText}` : ""}${formattedDate ? ` à partir de ${formattedDate}` : ""}`;
      
      const contact = [profileData?.phone_number, profileData?.professional_email, profileData?.linkedin_url]
        .filter(Boolean)
        .join(" • ");
      
      // Éviter la duplication si jobTitle commence déjà par "Stage" ou "STAGE"
      const formattedTitle = jobTitle.trim().match(/^stage\s*[-–]?\s*/i) 
        ? jobTitle 
        : `Stage – ${jobTitle}`;
      const title = `${formattedTitle} (${companyName})`;

      let y = topMargin;

      // === HEADER ===
      doc.setFont("Times", "Bold");
      doc.setFontSize(16);
      doc.text(name, pageWidth / 2, y, { align: "center" });
      y += 7;

      doc.setFont("Times", "Italic");
      doc.setFontSize(11);
      doc.text(subtitle, pageWidth / 2, y, { align: "center" });
      y += 6;

      doc.setFont("Times", "Roman");
      doc.setFontSize(10);
      doc.text(contact, pageWidth / 2, y, { align: "center" });
      y += 10;

      // === TITRE ===
      doc.setFont("Times", "Bold");
      doc.setFontSize(13);
      doc.text(title, pageWidth / 2, y, { align: "center" });
      y += 10;

      // === CORPS ===
      doc.setFont("Times", "Roman");
      doc.setFontSize(12);

      const lines = doc.splitTextToSize(generatedLetter, maxWidth);
      lines.forEach((line: string) => {
        if (y > pageHeight - bottomMargin) {
          doc.addPage();
          y = topMargin;
        }
        doc.text(line, leftMargin, y);
        y += 6;
      });

      // === SIGNATURE ===
      y += 10;
      doc.setFont("Times", "Bold");
      doc.text(name, leftMargin, y);

      doc.save(`lettre_motivation_${companyName}_${Date.now()}.pdf`);

      toast({
        title: "Téléchargement réussi",
        description: "Votre lettre a été téléchargée avec la mise en page professionnelle.",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la lettre.",
        variant: "destructive",
      });
    }
  };

  // 📋 Copie du texte
  const copyLetter = () => {
    navigator.clipboard
      .writeText(generatedLetter)
      .then(() => {
        setCopied(true);
        toast({
          title: "Lettre copiée",
          description: "Le texte de la lettre a été copié dans le presse-papier.",
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Error copying letter:", error);
        toast({
          title: "Erreur",
          description: "Impossible de copier la lettre.",
          variant: "destructive",
        });
      });
  };

  // ✏️ Ouvrir le dialogue d'édition de l'en-tête
  const openHeaderEdit = () => {
    setEditedProfileData(profileData ? { ...profileData } : {
      first_name: "",
      last_name: "",
      phone_number: "",
      professional_email: "",
      linkedin_url: "",
      desired_position: "",
      duration_min: "",
      duration_max: "",
      available_from: "",
    });
    setEditHeaderOpen(true);
  };

  // 💾 Sauvegarder les modifications de l'en-tête
  const saveHeaderEdit = () => {
    setProfileData(editedProfileData);
    setEditHeaderOpen(false);
    toast({
      title: "En-tête modifié",
      description: "Les informations de l'en-tête ont été mises à jour.",
    });
  };

  // 🔄 États visuels
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <h3 className="text-xl font-semibold text-foreground">Génération en cours...</h3>
        <p className="text-muted-foreground">Rédaction de votre lettre en cours</p>
      </div>
    );
  }

  if (!generatedLetter) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Sparkles className="w-20 h-20 text-primary" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Prêt à générer votre lettre de motivation</h2>
          <p className="text-muted-foreground">Cliquez sur le bouton ci-dessous pour lancer la génération</p>
        </div>
        <Button onClick={generateLetter} size="lg" className="mt-4">
          <Sparkles className="w-5 h-5 mr-2" />
          Générer ma lettre
        </Button>
      </div>
    );
  }

  // 🧾 Rendu final
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Votre lettre de motivation</h2>
        <p className="text-muted-foreground">Cliquez sur le texte ci-dessous pour le modifier directement</p>
      </div>

      <LetterPreview
        profileData={profileData}
        jobTitle={jobTitle}
        companyName={companyName}
        generatedLetter={generatedLetter}
        setGeneratedLetter={setGeneratedLetter}
      />

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={openHeaderEdit} variant="outline">
          <Edit3 className="w-4 h-4 mr-2" /> Modifier l'en-tête
        </Button>
        <Button onClick={copyLetter} variant="outline">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" /> Copié
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" /> Copier
            </>
          )}
        </Button>
        <Button onClick={downloadLetter} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Télécharger
        </Button>
        <Button onClick={saveLetter} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...
            </>
          ) : (
            "Sauvegarder"
          )}
        </Button>
      </div>

      {/* 📝 Dialogue d'édition de l'en-tête */}
      <Dialog open={editHeaderOpen} onOpenChange={setEditHeaderOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'en-tête de la lettre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  value={editedProfileData?.first_name || ""}
                  onChange={(e) =>
                    setEditedProfileData({ ...editedProfileData, first_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  value={editedProfileData?.last_name || ""}
                  onChange={(e) =>
                    setEditedProfileData({ ...editedProfileData, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Téléphone</Label>
              <Input
                id="phone_number"
                value={editedProfileData?.phone_number || ""}
                onChange={(e) =>
                  setEditedProfileData({ ...editedProfileData, phone_number: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="professional_email">Email professionnel</Label>
              <Input
                id="professional_email"
                type="email"
                value={editedProfileData?.professional_email || ""}
                onChange={(e) =>
                  setEditedProfileData({ ...editedProfileData, professional_email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                value={editedProfileData?.linkedin_url || ""}
                onChange={(e) =>
                  setEditedProfileData({ ...editedProfileData, linkedin_url: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desired_position">Poste recherché</Label>
              <Input
                id="desired_position"
                value={editedProfileData?.desired_position || ""}
                onChange={(e) =>
                  setEditedProfileData({ ...editedProfileData, desired_position: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_min">Durée min (mois)</Label>
                <Input
                  id="duration_min"
                  type="number"
                  value={editedProfileData?.duration_min || ""}
                  onChange={(e) =>
                    setEditedProfileData({ ...editedProfileData, duration_min: parseInt(e.target.value) || "" })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_max">Durée max (mois)</Label>
                <Input
                  id="duration_max"
                  type="number"
                  value={editedProfileData?.duration_max || ""}
                  onChange={(e) =>
                    setEditedProfileData({ ...editedProfileData, duration_max: parseInt(e.target.value) || "" })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="available_from">Disponible à partir de</Label>
              <Input
                id="available_from"
                type="date"
                value={editedProfileData?.available_from || ""}
                onChange={(e) =>
                  setEditedProfileData({ ...editedProfileData, available_from: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHeaderOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveHeaderEdit}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
