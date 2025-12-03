import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) throw error;

      toast({
        title: "Email de vérification envoyé !",
        description: "Vérifiez votre boîte mail pour activer votre compte.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      }
      
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Erreur lors de la déconnexion",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: "Email envoyé !",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Mot de passe modifié !",
        description: "Votre mot de passe a bien été mis à jour.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user?.email) {
        throw new Error("Aucun email trouvé");
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast({
        title: "Email renvoyé !",
        description: "Vérifiez votre boîte mail.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
  };
};
