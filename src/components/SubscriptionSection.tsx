import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, Sparkles, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionSectionProps {
  subscribed: boolean;
  subscriptionEnd: string | null;
  subscriptionPlan?: string | null;
  userId: string;
}

const SubscriptionSection = ({ subscribed, subscriptionEnd, subscriptionPlan, userId }: SubscriptionSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [totalGenerations, setTotalGenerations] = useState<number>(0);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenerationsCount = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("total_generations_count")
          .eq("id", userId)
          .single();
        if (error) throw error;
        setTotalGenerations(data?.total_generations_count || 0);
      } catch (error) {
        console.error("Error fetching generations count:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenerationsCount();
  }, [userId]);

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      toast({ title: "Erreur", description: "Impossible d'ouvrir le portail de gestion.", variant: "destructive" });
    } finally {
      setLoadingPortal(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const getPlanName = () => {
    if (!subscribed) return "Gratuit";
    if (subscriptionPlan === "weekly") return "Hebdomadaire";
    if (subscriptionPlan === "monthly") return "Mensuel";
    return "Premium";
  };

  const remainingLetters = Math.max(0, 5 - totalGenerations);

  return (
    <Card className="mb-8 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Mon abonnement
          </CardTitle>
          <Badge variant={subscribed ? "default" : "secondary"} className="text-sm">
            {getPlanName()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : subscribed ? (
          <>
            {subscriptionEnd && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Prochain renouvellement : {formatDate(subscriptionEnd)}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Vous bénéficiez de générations illimitées.
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                {remainingLetters > 0 
                  ? `${totalGenerations} / 5 lettres utilisées`
                  : "Limite atteinte (5/5)"}
              </span>
            </div>
            {remainingLetters > 0 ? (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(totalGenerations / 5) * 100}%` }}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Passez à un abonnement pour continuer à générer des lettres.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/tarifs")}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Voir les abonnements
          </Button>
          
          {subscribed && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="gap-2"
            >
              {loadingPortal ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Gérer mon abonnement
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSection;
