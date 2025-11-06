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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailType: "application" | "followup";
  emailContent: string | null;
  sentDate: string | null;
  recipient: string;
  onSave: (content: string, sentDate: string | null, recipient: string) => void;
  companyName: string;
  jobTitle: string;
}

export const EmailEditDialog = ({
  open,
  onOpenChange,
  emailType,
  emailContent,
  sentDate,
  recipient,
  onSave,
  companyName,
  jobTitle,
}: EmailEditDialogProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState(emailContent || "");
  const [emailSentDate, setEmailSentDate] = useState(sentDate || "");
  const [emailRecipient, setEmailRecipient] = useState(recipient);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setContent(emailContent || "");
    setEmailSentDate(sentDate || "");
    setEmailRecipient(recipient);
  }, [emailContent, sentDate, recipient]);

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
    onSave(content, emailSentDate || null, emailRecipient);
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
            <div>
              <Label htmlFor="email-content">Contenu de l'email</Label>
              <Textarea
                id="email-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] mt-2"
                placeholder={`Contenu de l'${title.toLowerCase()}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sent-date">Date d'envoi</Label>
                <Input
                  id="sent-date"
                  type="date"
                  value={emailSentDate}
                  onChange={(e) => setEmailSentDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="recipient">Adresse email destinataire</Label>
                <Input
                  id="recipient"
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="exemple@entreprise.com"
                  className="mt-2"
                />
              </div>
            </div>

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
