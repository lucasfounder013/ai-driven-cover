import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import * as pdfjsLib from "pdfjs-dist";
import * as mammoth from "mammoth";

// CORRECTION 1: Version fixe du worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

interface CVUploadStepProps {
  cvFile: File | null;
  setCvFile: (file: File | null) => void;
  setCvPath: (path: string) => void;
  setCvText: (text: string) => void;
}

export const CVUploadStep = ({ cvFile, setCvFile, setCvPath, setCvText }: CVUploadStepProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      return fullText.trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Impossible d'extraire le texte du PDF");
    }
  };

  // CORRECTION 2: Nouvelle fonction pour Word
  const extractTextFromWord = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (error) {
      console.error("Error extracting text from Word:", error);
      throw new Error("Impossible d'extraire le texte du fichier Word");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.log("No file or no user");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Veuillez uploader un fichier PDF ou Word",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      console.log("Starting file processing...");
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // CORRECTION 3: Extraction de texte améliorée
      let extractedText = "";

      if (file.type === "application/pdf") {
        console.log("Extracting text from PDF...");
        extractedText = await extractTextFromPDF(file);
        console.log("Text extracted, length:", extractedText.length);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        console.log("Extracting text from Word file...");
        extractedText = await extractTextFromWord(file);
        console.log("Text extracted, length:", extractedText.length);
      }

      // Vérifier que le texte a bien été extrait
      if (!extractedText || extractedText.length < 10) {
        throw new Error("Le fichier semble vide ou le texte n'a pas pu être extrait");
      }

      // Upload le fichier
      console.log("Uploading file to storage...");
      const { error } = await supabase.storage.from("cvs").upload(fileName, file, {
        upsert: true,
      });

      if (error) {
        console.error("Storage upload error:", error);
        throw error;
      }

      console.log("Upload successful");
      setCvFile(file);
      setCvPath(fileName);
      setCvText(extractedText);

      toast({
        title: "CV téléchargé et analysé",
        description: `${extractedText.length} caractères extraits avec succès`,
      });
    } catch (error: any) {
      console.error("Error uploading CV:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'uploader le CV",
        variant: "destructive",
      });
      // CORRECTION 4: Reset en cas d'erreur
      setCvFile(null);
      setCvPath("");
      setCvText("");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Téléchargez votre CV</h2>
        <p className="text-muted-foreground">Uploadez votre CV au format PDF ou Word (max 5MB)</p>
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        {!cvFile ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <Button
                variant="outline"
                disabled={uploading}
                className="cursor-pointer"
                onClick={() => document.getElementById("cv-upload")?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir un fichier
                  </>
                )}
              </Button>
              <input
                id="cv-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </div>
            <p className="text-sm text-muted-foreground">Formats acceptés : PDF, DOC, DOCX</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{cvFile.name}</p>
              <p className="text-sm text-muted-foreground">{(cvFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setCvFile(null);
                setCvPath("");
                setCvText("");
              }}
            >
              Changer de CV
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
