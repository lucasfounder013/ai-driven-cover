import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "jobboost_cookie_consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleChoice = (accepted: boolean) => {
    localStorage.setItem(COOKIE_KEY, accepted ? "accepted" : "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="container mx-auto max-w-3xl bg-card border border-border rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Ce site utilise des cookies pour améliorer votre expérience.{" "}
          <Link to="/cookies" className="text-primary underline">En savoir plus</Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => handleChoice(false)}>
            Refuser
          </Button>
          <Button size="sm" onClick={() => handleChoice(true)}>
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
