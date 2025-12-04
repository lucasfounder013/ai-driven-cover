import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const PRODUCTS = {
  weekly: {
    productId: "prod_TXg0AApkC5jJSs",
    name: "Hebdomadaire",
    price: "2,99€",
    period: "/semaine",
    features: [
      "Génération illimitée de lettres de motivation",
      "Emails de candidature personnalisés",
      "Suivi des candidatures",
      "Export PDF professionnel",
      "7 jours d'essai gratuit",
    ],
  },
  monthly: {
    productId: "prod_TXfzRYHgpmU4PT",
    name: "Mensuel",
    price: "9,99€",
    period: "/mois",
    features: [
      "Génération illimitée de lettres de motivation",
      "Emails de candidature personnalisés",
      "Suivi des candidatures",
      "Export PDF professionnel",
      "7 jours d'essai gratuit",
    ],
  },
};

const Tarifs = () => {
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubscribe = async (productId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour souscrire à un abonnement.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoadingProduct(productId);

    try {
      console.log("Calling create-checkout with productId:", productId);
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { productId },
      });

      console.log("Response:", { data, error });

      if (error) {
        console.error("Invoke error:", error);
        throw error;
      }

      if (data?.error) {
        console.error("Function returned error:", data.error);
        // Handle authentication errors from the edge function
        if (data.error.includes("not authenticated") || data.error.includes("email not available")) {
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter pour continuer.",
            variant: "destructive",
          });
          setLoadingProduct(null);
          navigate("/auth");
          return;
        }
        throw new Error(data.error);
      }

      if (data?.url) {
        console.log("Redirecting to:", data.url);
        // Don't reset loading state - let the redirect happen
        window.location.href = data.url;
        return; // Exit early, don't reset loading
      } else {
        console.error("No URL in response:", data);
        throw new Error("Aucune URL de paiement reçue");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la session de paiement.",
        variant: "destructive",
      });
      setLoadingProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choisis ton abonnement JobBoost
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accède à tous les outils premium pour booster ta recherche d'emploi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.entries(PRODUCTS).map(([key, plan]) => (
            <Card
              key={key}
              className="relative border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
            >
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Parfait pour booster vos candidatures
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
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
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleSubscribe(plan.productId)}
                  disabled={loadingProduct !== null}
                >
                  {loadingProduct === plan.productId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    `Choisir l'abonnement ${plan.name.toLowerCase()}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
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
