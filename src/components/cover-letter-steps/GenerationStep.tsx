import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, RotateCcw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GenerationStepProps {
  cvText: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  generatedLetter: string;
  setGeneratedLetter: (letter: string) => void;
  onReset: () => void;
}

export const GenerationStep = ({
  cvText,
  jobTitle,
  companyName,
  jobDescription,
  generatedLetter,
  setGeneratedLetter,
  onReset,
}: GenerationStepProps) => {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();


  const generateLetter = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      // Appeler l'edge function avec le texte du CV déjà extrait
      const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
        body: {
          jobTitle,
          companyName,
          jobDescription,
          cvText,
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
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour sauvegarder une lettre",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Vérifier que la session est valide
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Session invalide. Veuillez vous reconnecter.");
      }

      const { error } = await supabase.from("cover_letters").insert({
        user_id: session.user.id,
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
        cv_text: cvText,
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

  const downloadLetter = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `lettre_motivation_${companyName}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <h3 className="text-xl font-semibold text-foreground">
          Génération en cours...
        </h3>
        <p className="text-muted-foreground">
          Claude est en train de rédiger votre lettre de motivation
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
        <Button onClick={generateLetter} variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          Régénérer
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
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nouvelle lettre
        </Button>
      </div>
    </div>
  );
};
