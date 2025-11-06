import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface EmailViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  letter: {
    generated_letter: string;
    application_email: string | null;
    followup_email: string | null;
    company_name: string;
    job_title: string;
  } | null;
}

export const EmailViewDialog = ({ open, onOpenChange, letter }: EmailViewDialogProps) => {
  const { toast } = useToast();
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(type);
    toast({
      title: "Copié",
      description: `Le ${type} a été copié dans le presse-papiers`,
    });
    setTimeout(() => setCopiedTab(null), 2000);
  };

  if (!letter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {letter.company_name} - {letter.job_title}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="letter" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="letter">Lettre de motivation</TabsTrigger>
            <TabsTrigger value="application">Email de candidature</TabsTrigger>
            <TabsTrigger value="followup">Email de relance</TabsTrigger>
          </TabsList>

          <TabsContent value="letter" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Lettre de motivation</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(letter.generated_letter, "lettre de motivation")}
              >
                {copiedTab === "lettre de motivation" ? (
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
            <Textarea
              value={letter.generated_letter}
              readOnly
              className="min-h-[400px] font-serif"
            />
          </TabsContent>

          <TabsContent value="application" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email de candidature</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(letter.application_email || "", "email de candidature")}
                disabled={!letter.application_email}
              >
                {copiedTab === "email de candidature" ? (
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
            {letter.application_email ? (
              <Textarea
                value={letter.application_email}
                readOnly
                className="min-h-[300px]"
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun email de candidature généré pour cette lettre.</p>
                <p className="text-sm mt-2">Régénérez la lettre pour obtenir un email de candidature.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="followup" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email de relance</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(letter.followup_email || "", "email de relance")}
                disabled={!letter.followup_email}
              >
                {copiedTab === "email de relance" ? (
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
            {letter.followup_email ? (
              <Textarea
                value={letter.followup_email}
                readOnly
                className="min-h-[300px]"
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucun email de relance généré pour cette lettre.</p>
                <p className="text-sm mt-2">Régénérez la lettre pour obtenir un email de relance.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
