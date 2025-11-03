import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [desiredPosition, setDesiredPosition] = useState('');
  const [availableMonth, setAvailableMonth] = useState('');
  const [availableYear, setAvailableYear] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [durationMax, setDurationMax] = useState('');
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!loading && !user && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      navigate('/auth', { replace: true });
      return;
    }
    if (user && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      loadProfile();
    }
  }, [user, loading, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    if (data) {
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setProfessionalEmail(data.professional_email || '');
      setPhoneNumber(data.phone_number || '');
      setLinkedinUrl(data.linkedin_url || '');
      setAvatarUrl(data.avatar_url || '');
      setDesiredPosition(data.desired_position || '');
      setDurationMin(data.duration_min?.toString() || '');
      setDurationMax(data.duration_max?.toString() || '');
      
      // Parse available_from date (format: YYYY-MM-DD)
      if (data.available_from) {
        const [year, month] = data.available_from.split('-');
        setAvailableYear(year);
        setAvailableMonth(month);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;

    setIsUploading(true);

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      toast({
        title: 'Photo téléchargée',
        description: 'Votre photo de profil a été mise à jour.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger la photo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!firstName.trim() || !lastName.trim() || !professionalEmail.trim() || !phoneNumber.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format the date properly - ensure it's in YYYY-MM-DD format
      let formattedDate = null;
      if (availableYear && availableMonth) {
        formattedDate = `${availableYear}-${availableMonth}-01`;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          professional_email: professionalEmail,
          phone_number: phoneNumber,
          linkedin_url: linkedinUrl,
          avatar_url: avatarUrl,
          desired_position: desiredPosition || null,
          duration_min: durationMin ? parseInt(durationMin) : null,
          duration_max: durationMax ? parseInt(durationMax) : null,
          available_from: formattedDate,
          profile_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      });

      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le profil.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || '?';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complétez votre profil</CardTitle>
          <CardDescription>
            Renseignez vos informations professionnelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} alt="Photo de profil" />
                <AvatarFallback className="text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Ajouter une photo
                    </>
                  )}
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Prénom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Nom <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalEmail">
                Email professionnel <span className="text-destructive">*</span>
              </Label>
              <Input
                id="professionalEmail"
                type="email"
                placeholder="jean.dupont@entreprise.com"
                value={professionalEmail}
                onChange={(e) => setProfessionalEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Numéro de téléphone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">Profil LinkedIn (optionnel)</Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/votre-profil"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredPosition">Type de poste recherché (optionnel)</Label>
              <Select value={desiredPosition} onValueChange={setDesiredPosition} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type de poste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage">Stage</SelectItem>
                  <SelectItem value="alternance">Alternance</SelectItem>
                  <SelectItem value="premier_emploi">Premier emploi (CDI)</SelectItem>
                  <SelectItem value="cdd">CDD</SelectItem>
                  <SelectItem value="cdi">CDI</SelectItem>
                  <SelectItem value="freelance">Freelance/Mission</SelectItem>
                  <SelectItem value="interim">Intérim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Durée souhaitée du poste (optionnel)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Select value={durationMin} onValueChange={setDurationMin} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Durée minimum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 mois</SelectItem>
                      <SelectItem value="2">2 mois</SelectItem>
                      <SelectItem value="3">3 mois</SelectItem>
                      <SelectItem value="6">6 mois</SelectItem>
                      <SelectItem value="12">12 mois</SelectItem>
                      <SelectItem value="18">18 mois</SelectItem>
                      <SelectItem value="24">24 mois</SelectItem>
                      <SelectItem value="36">36 mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Select value={durationMax} onValueChange={setDurationMax} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Durée maximum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 mois</SelectItem>
                      <SelectItem value="2">2 mois</SelectItem>
                      <SelectItem value="3">3 mois</SelectItem>
                      <SelectItem value="6">6 mois</SelectItem>
                      <SelectItem value="12">12 mois</SelectItem>
                      <SelectItem value="18">18 mois</SelectItem>
                      <SelectItem value="24">24 mois</SelectItem>
                      <SelectItem value="36">36 mois</SelectItem>
                      <SelectItem value="unlimited">Indéterminée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Disponible à partir de (optionnel)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Select value={availableMonth} onValueChange={setAvailableMonth} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mois" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">Janvier</SelectItem>
                      <SelectItem value="02">Février</SelectItem>
                      <SelectItem value="03">Mars</SelectItem>
                      <SelectItem value="04">Avril</SelectItem>
                      <SelectItem value="05">Mai</SelectItem>
                      <SelectItem value="06">Juin</SelectItem>
                      <SelectItem value="07">Juillet</SelectItem>
                      <SelectItem value="08">Août</SelectItem>
                      <SelectItem value="09">Septembre</SelectItem>
                      <SelectItem value="10">Octobre</SelectItem>
                      <SelectItem value="11">Novembre</SelectItem>
                      <SelectItem value="12">Décembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Select value={availableYear} onValueChange={setAvailableYear} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
                className="flex-1"
              >
                Plus tard
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
