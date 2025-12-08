import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Shield, Star, Quote, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const PLANS = {
  free: {
    name: "Gratuit",
    subtitle: "Idéal pour découvrir JobBoost.",
    price: "0€",
    period: "",
    features: [
      "Génération de lettres de motivation",
      "Génération d'emails de candidature",
      "Génération d'emails de relance",
      "Export PDF",
    ],
    limitation: "5 lettres gratuites (lettres + emails confondus)",
    isBestChoice: false,
    isPaid: false,
  },
  weekly: {
    priceId: "price_1Saae7JDrYaA8zu3ZPwQyUhc",
    name: "Hebdomadaire",
    subtitle: "Parfait pour une courte période de candidature.",
    price: "2,99€",
    period: "/semaine",
    features: [
      "Génération illimitée de lettres de motivation",
      "Génération illimitée d'emails de candidature",
      "Génération illimitée d'emails de relance",
      "Export PDF",
    ],
    isBestChoice: false,
    isPaid: true,
  },
  monthly: {
    priceId: "price_1SaadvJDrYaA8zu34NVADeb3",
    name: "Mensuel",
    subtitle: "Le meilleur choix pour une recherche d'emploi continue.",
    price: "9,99€",
    period: "/mois",
    features: [
      "Génération illimitée de lettres de motivation",
      "Génération illimitée d'emails de candidature",
      "Génération illimitée d'emails de relance",
      "Export PDF",
    ],
    isBestChoice: true,
    isPaid: true,
  },
};

const TESTIMONIALS = [
  {
    name: "Marie L.",
    role: "Chargée de marketing",
    content: "J'ai décroché 3 entretiens en une semaine grâce à JobBoost. Les lettres sont vraiment personnalisées !",
  },
  {
    name: "Thomas D.",
    role: "Développeur junior",
    content: "Un gain de temps incroyable. Je postule maintenant en 2 minutes au lieu de 30.",
  },
  {
    name: "Sophie M.",
    role: "Étudiante en commerce",
    content: "Parfait pour ma recherche de stage. Les recruteurs ont remarqué la qualité de mes candidatures.",
  },
];

const Tarifs = () => {
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour souscrire à un abonnement.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoadingPrice(priceId);

    try {
      console.log("Calling create-checkout with priceId:", priceId);

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      console.log("create-checkout response", { data, error });

      if (error) {
        console.error("Invoke error:", error);
        throw error;
      }

      if (data?.error) {
        console.error("Function returned error:", data.error);
        if (data.error.includes("not authenticated") || data.error.includes("email not available")) {
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter pour continuer.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        throw new Error(data.error);
      }

      if (data?.url) {
        console.log("Redirecting to Stripe Checkout:", data.url);
        window.location.assign(data.url);
        return;
      }

      console.error("No URL in response:", data);
      toast({
        title: "Erreur",
        description: "Aucune URL de paiement reçue depuis Stripe.",
        variant: "destructive",
      });
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Erreur",
        description: err?.message || "Une erreur est survenue lors de la création de la session de paiement.",
        variant: "destructive",
      });
    } finally {
      setLoadingPrice(null);
    }
  };

  const handleFreePlan = async () => {
    if (!user) {
      navigate("/auth");
    } else {
      // Mark has_seen_pricing as true
      try {
        await supabase
          .from("profiles")
          .update({ has_seen_pricing: true })
          .eq("id", user.id);
      } catch (error) {
        console.error("Error updating has_seen_pricing:", error);
      }
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Choisis ton abonnement JobBoost</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Obtiens plus d&apos;entretiens, plus vite — grâce à des candidatures professionnelles prêtes en quelques
            secondes.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {Object.entries(PLANS).map(([key, plan]) => (
            <Card
              key={key}
              className={`relative border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.isBestChoice
                  ? "border-primary shadow-xl shadow-primary/10 scale-[1.02]"
                  : "border-border hover:border-primary/50 shadow-lg"
              }`}
            >
              {plan.isBestChoice && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
                  <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                  Meilleur choix
                </Badge>
              )}

              <CardHeader className="text-center pb-4 pt-8">
                <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">{plan.subtitle}</CardDescription>
                <div className="mt-6">
                  <span className="text-5xl md:text-6xl font-bold text-primary">{plan.price}</span>
                  {plan.period && <span className="text-lg text-muted-foreground">{plan.period}</span>}
                </div>
              </CardHeader>

              <CardContent className="pb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                  {'limitation' in plan && plan.limitation && (
                    <li className="flex items-center gap-3 pt-2 border-t border-border/50">
                      <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm font-medium">{plan.limitation}</span>
                    </li>
                  )}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                {plan.isPaid ? (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleSubscribe((plan as any).priceId)}
                      disabled={loadingPrice === (plan as any).priceId}
                    >
                      {loadingPrice === (plan as any).priceId ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        `Débloquer l'illimité (${plan.name.toLowerCase()})`
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Annulation à tout moment
                    </p>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      onClick={handleFreePlan}
                    >
                      {user ? "Utiliser mes 5 lettres gratuites" : "Commencer gratuitement"}
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Sans carte bancaire
                    </p>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Ils utilisent JobBoost</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="border border-border/50 shadow-md bg-card/50">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-foreground/90 mb-4 italic">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5" />
            <span>Paiement sécurisé via Stripe • Annulation à tout moment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tarifs;