import { Target, Zap, Mail, BarChart3, Pencil } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Ultra-personnalisé",
    description: "Chaque lettre est adaptée à votre CV et au poste visé.",
  },
  {
    icon: Zap,
    title: "Gagnez des heures",
    description: "Une lettre prête en 30 secondes au lieu de 30 minutes.",
  },
  {
    icon: Mail,
    title: "Emails de candidature et de relance inclus",
    description: "Une candidature complète générée automatiquement.",
  },
  {
    icon: BarChart3,
    title: "Suivi simplifié des candidatures",
    description: "Gardez une vue claire de toutes vos démarches.",
  },
  {
    icon: Pencil,
    title: "Modifiable à volonté",
    description: "Ajustez les lettres facilement grâce à l'éditeur intégré.",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Pourquoi JobBoost est différent ?
            </h2>
          </div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-card rounded-2xl p-6 border border-border hover:border-foreground/10 transition-colors duration-300 ${
                  index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
