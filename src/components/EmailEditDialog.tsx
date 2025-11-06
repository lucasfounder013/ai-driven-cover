import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailType: "application" | "followup";
  emailContent: string | null;
  onSave: (content: string) => void;
  companyName: string;
  jobTitle: string;
}

export const EmailEditDialog = ({
  open,
  onOpenChange,
  emailType,
  emailContent,
  onSave,
  companyName,
  jobTitle,
}: EmailEditDialogProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState(emailContent || "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setContent(emailContent || "");
  }, [emailContent]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      title: "Copié",
      description: "L'email a été copié dans le presse-papiers",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(content);
    onOpenChange(false);
  };

  const title = emailType === "application" 
    ? "Email de candidature" 
    : "Email de relance";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {title} - {companyName} ({jobTitle})
          </DialogTitle>
        </DialogHeader>

        {emailContent ? (
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px]"
              placeholder={`Contenu de l'${title.toLowerCase()}`}
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
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
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun {title.toLowerCase()} généré pour cette lettre.</p>
            <p className="text-sm mt-2">
              Régénérez la lettre pour obtenir un {title.toLowerCase()}.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {emailContent && (
            <Button onClick={handleSave}>
              Enregistrer les modifications
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
