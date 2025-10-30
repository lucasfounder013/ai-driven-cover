import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!showForm ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Générateur de lettres de motivation
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Créez des lettres de motivation personnalisées avec l'aide de l'IA
              </p>
              <CoverLetterForm />
            </div>
          </>
        ) : (
          <CoverLetterForm />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
