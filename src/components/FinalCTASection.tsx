import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-6 tracking-tight leading-tight">
            Prêt à décrocher votre prochain emploi ?
          </h2>
          <p className="text-lg text-background/70 mb-10">
            Créez votre première lettre de motivation en quelques minutes.
          </p>
          <Button 
            size="xl" 
            className="gap-2 min-w-[280px] bg-background text-foreground hover:bg-background/90"
            onClick={() => navigate('/auth')}
          >
            Commencer maintenant
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
