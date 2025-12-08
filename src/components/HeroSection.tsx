import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  const benefits = [
    "5 candidatures gratuites",
    "Aucune carte requise",
    "Résultat instantané",
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 via-background to-secondary/30" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Créez des candidatures{" "}
            <span className="text-accent">irrésistibles</span>{" "}
            en quelques minutes
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            Trouvez un emploi plus vite grâce à des lettres et e-mails personnalisés générés par l'intelligence artificielle.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-sm md:text-base text-foreground/80"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/20">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-7 duration-700 delay-500">
            <Button 
              size="xl" 
              className="gap-2 min-w-[320px] bg-foreground text-background hover:bg-foreground/90 shadow-lg"
              onClick={() => navigate('/auth')}
            >
              Créer ma première lettre gratuitement
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="xl" 
              className="min-w-[160px] text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/auth')}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
