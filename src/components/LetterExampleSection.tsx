const LetterExampleSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Exemple de lettre générée
            </h2>
            <p className="text-muted-foreground">
              Aperçu d'une lettre créée par JobBoost
            </p>
          </div>

          {/* Letter example */}
          <div className="relative">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 rounded-3xl" />
            
            <div className="relative bg-card rounded-2xl p-8 md:p-12 border border-border shadow-sm">
              {/* Header decoration */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>

              {/* Letter content */}
              <div className="space-y-4 font-serif">
                <p className="text-foreground font-medium">
                  Madame, Monsieur,
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Actuellement [votre situation], je me permets de vous adresser ma candidature pour le poste de [intitulé]. Motivé et rigoureux, je souhaite mettre mes compétences au service de votre équipe…
                </p>
              </div>

              {/* Typing indicator */}
              <div className="flex gap-1.5 mt-6">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse delay-100" />
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse delay-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LetterExampleSection;
