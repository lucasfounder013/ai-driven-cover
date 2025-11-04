import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (user && !loading && !hasRedirected.current) {
        hasRedirected.current = true;
        
        const { data } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('id', user.id)
          .single();
        
        if (data && !data.profile_completed) {
          navigate('/profile', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    };
    
    checkProfileCompletion();
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Rocket className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">
              Job Boost
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? 'Connectez-vous pour accéder à vos lettres'
              : 'Créez votre compte pour commencer'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Minimum 6 caractères
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading
                ? 'Chargement...'
                : isLogin
                ? 'Se connecter'
                : 'Créer mon compte'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              disabled={isLoading}
            >
              {isLogin ? (
                <>
                  Pas encore de compte ?{' '}
                  <span className="font-semibold text-primary">
                    Créer un compte
                  </span>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <span className="font-semibold text-primary">
                    Se connecter
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
