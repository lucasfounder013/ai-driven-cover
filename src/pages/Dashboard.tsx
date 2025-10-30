import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Download, Trash2 } from "lucide-react";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [letters, setLetters] = useState<any[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && !showForm) {
      fetchLetters();
    }
  }, [user, showForm]);

  const fetchLetters = async () => {
    setLoadingLetters(true);
    try {
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLetters(data || []);
    } catch (error: any) {
      console.error('Error fetching letters:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les lettres",
        variant: "destructive",
      });
    } finally {
      setLoadingLetters(false);
    }
  };

  const deleteLetter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cover_letters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Lettre supprimée",
        description: "La lettre a été supprimée avec succès",
      });

      fetchLetters();
    } catch (error: any) {
      console.error('Error deleting letter:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la lettre",
        variant: "destructive",
      });
    }
  };

  const downloadLetter = (letter: any) => {
    const element = document.createElement("a");
    const file = new Blob([letter.generated_letter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `lettre_motivation_${letter.company_name}_${new Date(letter.created_at).toLocaleDateString()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
      
      <main className="container mx-auto px-4 py-8">
        {!showForm ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Mes lettres de motivation
                </h1>
                <p className="text-lg text-muted-foreground">
                  Gérez et créez vos lettres de motivation
                </p>
              </div>
              <Button size="lg" className="gap-2" onClick={() => setShowForm(true)}>
                <Plus className="w-5 h-5" />
                Nouvelle lettre
              </Button>
            </div>

            {loadingLetters ? (
              <div className="bg-card rounded-xl border border-border p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : letters.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Aucune lettre pour le moment
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Créez votre première lettre de motivation avec l'IA
                </p>
                <Button size="lg" className="gap-2" onClick={() => setShowForm(true)}>
                  <Plus className="w-5 h-5" />
                  Créer ma première lettre
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {letters.map((letter) => (
                  <Card key={letter.id} className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {letter.job_title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {letter.company_name}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {letter.generated_letter}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {new Date(letter.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadLetter(letter)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteLetter(letter.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <CoverLetterForm />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
