import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  subscriptionEnd: string | null;
  subscriptionPlan: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscriptionEnd: null,
    subscriptionPlan: null,
  });
  const { toast } = useToast();

  const checkSubscriptionFromDB = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_active_subscription, subscription_end_date, subscription_plan, subscription_status')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setSubscriptionStatus({
          subscribed: data.has_active_subscription || data.subscription_status === 'active',
          subscriptionEnd: data.subscription_end_date || null,
          subscriptionPlan: data.subscription_plan || null,
        });
      }
    } catch (err) {
      console.error('Error reading subscription from DB:', err);
    }
  };

  const checkSubscription = async (userId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Edge function failed, falling back to DB:', error);
        if (userId) await checkSubscriptionFromDB(userId);
        return;
      }

      if (data) {
        setSubscriptionStatus({
          subscribed: data.subscribed || false,
          subscriptionEnd: data.subscription_end || null,
          subscriptionPlan: data.subscription_plan || null,
        });
      }
    } catch (error) {
      console.error('Error checking subscription, falling back to DB:', error);
      if (userId) await checkSubscriptionFromDB(userId);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          setTimeout(() => checkSubscription(session.user.id), 0);
        } else {
          setSubscriptionStatus({ subscribed: false, subscriptionEnd: null, subscriptionPlan: null });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => checkSubscription(session.user.id), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => checkSubscription(user.id), 60000);
    return () => clearInterval(interval);
  }, [user]);

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) throw error;
      toast({ title: "Email de vérification envoyé !", description: "Vérifiez votre boîte mail pour activer votre compte." });
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({ title: "Erreur lors de l'inscription", description: error.message, variant: "destructive" });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      }
      toast({ title: "Erreur de connexion", description: errorMessage, variant: "destructive" });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error && !error.message.includes('Auth session missing')) throw error;
      setSession(null);
      setUser(null);
      setSubscriptionStatus({ subscribed: false, subscriptionEnd: null, subscriptionPlan: null });
      toast({ title: "Déconnexion réussie", description: "À bientôt !" });
    } catch (error: any) {
      console.error('Sign out error:', error);
      setSession(null);
      setUser(null);
      setSubscriptionStatus({ subscribed: false, subscriptionEnd: null, subscriptionPlan: null });
      toast({ title: "Erreur lors de la déconnexion", description: error.message, variant: "destructive" });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      if (error) throw error;
      toast({ title: "Email envoyé !", description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe." });
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Mot de passe modifié !", description: "Votre mot de passe a bien été mis à jour." });
      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user?.email) throw new Error("Aucun email trouvé");
      const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
      if (error) throw error;
      toast({ title: "Email renvoyé !", description: "Vérifiez votre boîte mail." });
      return { error: null };
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return { error };
    }
  };

  return {
    user, session, loading, subscriptionStatus, checkSubscription,
    signUp, signIn, signOut, resetPassword, updatePassword, resendVerificationEmail,
  };
};
