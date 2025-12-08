import { Shield, Zap, FileText } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Personnalisé",
    description: "Chaque lettre est unique et adaptée à votre profil et au poste visé",
    iconColor: "text-[hsl(234,70%,60%)]",
  },
  {
    icon: Zap,
    title: "Rapide et efficace",
    description: "Générez une lettre professionnelle en moins de 2 minutes",
    iconColor: "text-[hsl(234,70%,60%)]",
  },
  {
    icon: FileText,
    title: "Modifiable à volonté",
    description: "Ajustez le contenu généré selon vos préférences avec notre éditeur",
    iconColor: "text-[hsl(234,70%,60%)]",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Features List */}
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                Pourquoi choisir notre solution ?
              </h2>

              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Example Card */}
            <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)] border border-border">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center border-b border-border pb-4">
                  <h4 className="text-xl font-bold text-foreground tracking-wide">NOM PRÉNOM</h4>
                  <p className="text-muted-foreground italic text-sm mt-1">Stage</p>
                </div>
                
                {/* Job Title */}
                <div className="text-center">
                  <p className="text-foreground font-semibold text-sm leading-snug">
                    STAGE - Chargé-e d'engagement et valorisation RSE - Janvier 2026 - (H/F) (Vinco)
                  </p>
                </div>
                
                {/* Letter Content */}
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p>Madame, Monsieur,</p>
                  <p>
                    Actuellement en dernière année à Chimie ParisTech, je suis à la recherche d'un stage de fin d'études à partir de février 2026 et je suis vivement intéressé par le poste de Chargé d'engagement et valorisation RSE au sein de Vinco. Mon parcours d'ingénieur en chimie, complété par une sensibilité marquée pour les enjeux de développement durable, me permet d'envisager ce stage comme une opportunité d'allier expertise scientifique et engagement sociétal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
