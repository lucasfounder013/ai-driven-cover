import { FileUp, ClipboardList, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Téléversez votre CV",
    description: "Importez votre CV en PDF ou DOCX, ou collez directement son contenu.",
    icon: FileUp,
  },
  {
    number: "02",
    title: "Décrivez le poste",
    description: "Collez l'annonce du poste ou décrivez vos aspirations professionnelles.",
    icon: ClipboardList,
  },
  {
    number: "03",
    title: "Générez et modifiez",
    description: "L'IA crée une lettre personnalisée que vous pouvez ajuster à votre convenance.",
    icon: Sparkles,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground">
            Un processus simple et rapide en 3 étapes
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative group"
              >
                {/* Connection line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-px bg-border" />
                )}
                
                <div className="relative bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                  {/* Step number */}
                  <div className="text-5xl font-bold text-muted/50 mb-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-5">
                    <step.icon className="w-6 h-6 text-foreground" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
