import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Prêt à accélérer votre recherche d'emploi ?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Créez votre première lettre professionnelle en quelques minutes.
          </p>
          <Button 
            variant="hero" 
            size="xl" 
            className="gap-2 min-w-[280px]"
            onClick={() => navigate('/auth')}
          >
            <Sparkles className="w-5 h-5" />
            Commencer maintenant
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
