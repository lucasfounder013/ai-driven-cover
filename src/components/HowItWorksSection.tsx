import { Card } from "@/components/ui/card";
import { FileText, Zap, Sparkles } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Importez votre CV",
    description: "Importez votre CV en PDF ou DOCX",
    icon: FileText,
    bgColor: "bg-[hsl(234,60%,92%)]",
    iconColor: "text-[hsl(234,70%,60%)]",
  },
  {
    number: "2",
    title: "Décrivez le poste",
    description: "Collez l'offre ou décrivez votre objectif",
    icon: Zap,
    bgColor: "bg-[hsl(234,60%,92%)]",
    iconColor: "text-[hsl(234,70%,60%)]",
  },
  {
    number: "3",
    title: "Générez et modifiez",
    description: "JobBoost génère une lettre personnalisée que vous pouvez modifier",
    icon: Sparkles,
    bgColor: "bg-[hsl(18,88%,90%)]",
    iconColor: "text-accent",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground">
            Un processus simple et rapide en 3 étapes
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="p-8 text-center border-border shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow duration-300"
            >
              {/* Icon */}
              <div className={`${step.bgColor} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                <step.icon className={`w-10 h-10 ${step.iconColor}`} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-3">
                {step.number}. {step.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
