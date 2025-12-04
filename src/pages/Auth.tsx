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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const { user, loading, signIn, signUp, resetPassword, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      if (user && !loading && !hasRedirected.current) {
        // Verify the session is actually valid on the server
        const { data: { user: serverUser }, error } = await supabase.auth.getUser();
        
        if (error || !serverUser) {
          // Session is invalid, clear local state
          return;
        }

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
    
    checkSessionAndRedirect();
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (!error) {
          setIsForgotPassword(false);
          setEmail('');
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error && error.message.includes('Email not confirmed')) {
          setShowEmailVerification(true);
        }
      } else {
        const { error } = await signUp(email, password);
        if (!error) {
          setShowEmailVerification(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    await resendVerificationEmail();
    setIsLoading(false);
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
            {isForgotPassword ? 'Mot de passe oublié' : isLogin ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-muted-foreground">
            {isForgotPassword
              ? 'Entrez votre email pour recevoir un lien de réinitialisation'
              : isLogin
              ? 'Connectez-vous pour accéder à vos lettres'
              : 'Créez votre compte pour commencer'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          {showEmailVerification ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Vérifiez votre email
                </h2>
                <p className="text-muted-foreground mb-4">
                  Un email de vérification a été envoyé à <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur le lien dans l'email pour activer votre compte.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Envoi...' : 'Renvoyer l\'email'}
                </Button>
                <button
                  onClick={() => {
                    setShowEmailVerification(false);
                    setEmail('');
                    setPassword('');
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Retour à la connexion
                </button>
              </div>
            </div>
          ) : (
            <>
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

                {!isForgotPassword && (
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
                )}

                {isLogin && !isForgotPassword && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Chargement...'
                    : isForgotPassword
                    ? 'Envoyer le lien'
                    : isLogin
                    ? 'Se connecter'
                    : 'Créer mon compte'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                {isForgotPassword ? (
                  <button
                    onClick={() => setIsForgotPassword(false)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    disabled={isLoading}
                  >
                    Retour à la connexion
                  </button>
                ) : (
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
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
