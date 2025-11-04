import { Rocket, User, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Rocket className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">
            Job Boost
          </span>
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5" />
            <span className="font-medium">{user?.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <UserCircle className="w-5 h-5" />
            <span className="font-medium">Profil</span>
          </Button>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
