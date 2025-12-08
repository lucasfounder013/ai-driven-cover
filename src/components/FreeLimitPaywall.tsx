import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket } from "lucide-react";

interface FreeLimitPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FreeLimitPaywall = ({ open, onOpenChange }: FreeLimitPaywallProps) => {
  const navigate = useNavigate();

  const handleViewPlans = () => {
    onOpenChange(false);
    navigate("/tarifs");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Tu as utilisé tes 5 lettres gratuites 🎉</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Pour continuer à générer des lettres et emails sans limite, choisis un abonnement.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Rocket className="h-5 w-5 text-primary flex-shrink-0" />
            <span>
              Avec un abonnement, génère autant de lettres de motivation et d'emails que tu veux !
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button onClick={handleViewPlans} className="w-full" size="lg">
            Voir les abonnements
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
          >
            Plus tard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FreeLimitPaywall;