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
              <div className="space-y-4">
                <div className="text-muted-foreground text-sm font-mono">
                  // Exemple de génération
                </div>
                <div className="space-y-3 text-sm">
                  <p className="text-[hsl(234,70%,60%)] font-medium">
                    Madame, Monsieur,
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Actuellement [votre situation], je me permets de vous adresser ma candidature pour le poste de [intitulé]...
                  </p>
                  <div className="flex gap-1.5 pt-2">
                    <div className="w-2 h-2 rounded-full bg-[hsl(234,70%,60%)]"></div>
                    <div className="w-2 h-2 rounded-full bg-[hsl(234,70%,60%)]"></div>
                    <div className="w-2 h-2 rounded-full bg-[hsl(234,70%,60%)]"></div>
                  </div>
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
