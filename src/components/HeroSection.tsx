import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--gradient-badge)] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            Propulsé par l'Intelligence Artificielle
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-primary leading-tight mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
          Obtenez plus d'entretiens grâce à des
          <br />
          <span className="bg-gradient-to-r from-primary via-[hsl(234,60%,50%)] to-[hsl(250,70%,60%)] bg-clip-text text-transparent">
            candidatures professionnelles
          </span>
          <br />
          générées en quelques minutes
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          Créez des lettres de motivation et emails personnalisés pour chaque offre, en gagnant un temps précieux.
        </p>

        {/* Bullet points */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>5 candidatures gratuites</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Résultat instantané</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-7 duration-700 delay-500">
          <Button 
            variant="hero" 
            size="xl" 
            className="gap-2 min-w-[280px]"
            onClick={() => navigate('/auth')}
          >
            <Sparkles className="w-5 h-5" />
            Créer ma première lettre gratuitement
          </Button>
          <Button 
            variant="outline-white" 
            size="xl" 
            className="min-w-[200px]"
            onClick={() => navigate('/auth')}
          >
            Se connecter
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
