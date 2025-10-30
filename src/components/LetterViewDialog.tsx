import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X } from "lucide-react";

interface LetterViewDialogProps {
  letter: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function LetterViewDialog({ letter, open, onOpenChange, onUpdate }: LetterViewDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(letter?.generated_letter || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!letter) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('cover_letters')
        .update({ generated_letter: editedContent })
        .eq('id', letter.id);

      if (error) throw error;

      toast({
        title: "Lettre mise à jour",
        description: "La lettre a été modifiée avec succès",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating letter:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la lettre",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false);
      setEditedContent(letter?.generated_letter || "");
    }
    onOpenChange(newOpen);
  };

  if (!letter) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {letter.job_title} - {letter.company_name}
          </DialogTitle>
          <DialogDescription>
            Créée le {new Date(letter.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
          ) : (
            <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
              {letter.generated_letter}
            </div>
          )}
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(letter.generated_letter);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
