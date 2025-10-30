import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Mes lettres de motivation
            </h1>
            <p className="text-lg text-muted-foreground">
              Gérez et créez vos lettres de motivation
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle lettre
          </Button>
        </div>

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
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Créer ma première lettre
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
