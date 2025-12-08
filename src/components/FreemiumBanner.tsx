import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const FreemiumBanner = () => {
  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-foreground">
            Profite de JobBoost sans limite avec l'abonnement hebdomadaire ou mensuel —{" "}
            <Link to="/tarifs" className="text-primary font-semibold hover:underline">
              Voir les abonnements
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default FreemiumBanner;