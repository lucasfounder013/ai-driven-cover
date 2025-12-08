import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, checkSubscription } = useAuth();
  const [updating, setUpdating] = useState(true);

  useEffect(() => {
    const updatePricingFlag = async () => {
      if (!user) return;

      try {
        // Mark has_seen_pricing as true after successful payment
        await supabase
          .from("profiles")
          .update({ has_seen_pricing: true })
          .eq("id", user.id);

        // Refresh subscription status
        await checkSubscription();
      } catch (error) {
        console.error("Error updating profile:", error);
      } finally {
        setUpdating(false);
      }
    };

    if (user && !loading) {
      updatePricingFlag();
    }
  }, [user, loading, checkSubscription]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading || updating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validation de votre abonnement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Paiement réussi !</CardTitle>
          <CardDescription className="text-base">
            Merci pour votre abonnement. Vous pouvez maintenant profiter de JobBoost sans limite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => navigate("/dashboard")}
          >
            Accéder au Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;