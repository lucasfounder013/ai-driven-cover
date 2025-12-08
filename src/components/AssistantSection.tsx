import { FolderOpen, Send, Bell, Clock, Smile } from "lucide-react";

const features = [
  {
    icon: FolderOpen,
    text: "Organisez vos candidatures dans des dossiers",
  },
  {
    icon: Send,
    text: "Suivez vos envois facilement",
  },
  {
    icon: Bell,
    text: "Relancez les recruteurs automatiquement",
  },
  {
    icon: Clock,
    text: "Gagnez des heures chaque semaine",
  },
  {
    icon: Smile,
    text: "Restez motivé et structuré dans vos démarches",
  },
];

const AssistantSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                Votre assistant pour accélérer votre recherche d'emploi
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                JobBoost ne rédige pas seulement vos lettres : il vous aide à postuler plus vite et mieux, pour obtenir des entretiens plus rapidement.
              </p>

              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li 
                    key={index}
                    className="flex items-center gap-4 text-foreground"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-base md:text-lg">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-secondary via-secondary/50 to-accent/10 rounded-3xl p-8 md:p-12">
                {/* Decorative cards */}
                <div className="space-y-4">
                  <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-foreground">Candidature envoyée</span>
                      <span className="ml-auto text-xs text-muted-foreground">Il y a 2h</span>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-sm font-medium text-foreground">Relance programmée</span>
                      <span className="ml-auto text-xs text-muted-foreground">Dans 5 jours</span>
                    </div>
                  </div>
                  <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium text-foreground">Entretien confirmé</span>
                      <span className="ml-auto text-xs text-muted-foreground">Demain 14h</span>
                    </div>
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

export default AssistantSection;
