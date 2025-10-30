import { FileText, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardHeader = () => {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-foreground">CoverLetter</span>{" "}
            <span className="text-primary">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <User className="w-5 h-5" />
            <span className="font-medium">Tableau de bord</span>
          </button>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
