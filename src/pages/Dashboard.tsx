import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Trash2, Pencil, Copy, Edit2, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CoverLetterForm } from "@/components/CoverLetterForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmailViewDialog } from "@/components/EmailViewDialog";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [letters, setLetters] = useState<any[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(true);
  const [editingLetter, setEditingLetter] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<{ id: string; field: 'company_name' | 'job_title'; value: string } | null>(null);
  const [viewingLetter, setViewingLetter] = useState<any>(null);
  const [emailViewOpen, setEmailViewOpen] = useState(false);

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

  const copyLetter = (letter: any) => {
    navigator.clipboard.writeText(letter.generated_letter);
    toast({
      title: "Lettre copiée",
      description: "La lettre a été copiée dans le presse-papiers",
    });
  };

  const openLetter = (letter: any) => {
    setEditingLetter(letter);
    setShowForm(true);
  };

  const viewLetter = (letter: any) => {
    setViewingLetter(letter);
    setEmailViewOpen(true);
  };

  const openEditDialog = (letter: any, field: 'company_name' | 'job_title') => {
    setEditingField({
      id: letter.id,
      field,
      value: letter[field]
    });
    setEditDialogOpen(true);
  };

  const saveFieldEdit = async () => {
    if (!editingField) return;

    try {
      const { error } = await supabase
        .from('cover_letters')
        .update({ [editingField.field]: editingField.value })
        .eq('id', editingField.id);

      if (error) throw error;

      toast({
        title: "Modifié",
        description: "La modification a été enregistrée",
      });

      fetchLetters();
      setEditDialogOpen(false);
      setEditingField(null);
    } catch (error: any) {
      console.error('Error updating field:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier",
        variant: "destructive",
      });
    }
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
      <DashboardHeader onLogoClick={() => setShowForm(false)} />
      
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
              <Button size="lg" className="gap-2" onClick={() => {
                setEditingLetter(null);
                setShowForm(true);
              }}>
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
                <Button size="lg" className="gap-2" onClick={() => {
                  setEditingLetter(null);
                  setShowForm(true);
                }}>
                  <Plus className="w-5 h-5" />
                  Créer ma première lettre
                </Button>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom de l'entreprise</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {letters.map((letter) => (
                      <TableRow key={letter.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span 
                              className="cursor-pointer hover:text-primary transition-colors"
                              onClick={() => openLetter(letter)}
                              title={letter.company_name}
                            >
                              {letter.company_name.length > 20 
                                ? `${letter.company_name.substring(0, 20)}...` 
                                : letter.company_name}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(letter, 'company_name')}
                              title="Modifier le nom de l'entreprise"
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span 
                              className="cursor-pointer hover:text-primary transition-colors"
                              onClick={() => openLetter(letter)}
                            >
                              {letter.job_title}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(letter, 'job_title')}
                              title="Modifier le poste"
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(letter.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewLetter(letter)}
                              title="Voir la lettre et les emails"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyLetter(letter)}
                              title="Copier la lettre"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openLetter(letter)}
                              title="Modifier la lettre"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteLetter(letter.id)}
                              title="Supprimer la lettre"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <CoverLetterForm 
              editingLetter={editingLetter}
              onBack={() => {
                setShowForm(false);
                setEditingLetter(null);
                fetchLetters();
              }}
            />
          </div>
        )}
      </main>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingField?.field === 'company_name' 
                ? "Modifier le nom de l'entreprise" 
                : "Modifier le poste"}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={editingField?.value || ''}
            onChange={(e) => setEditingField(editingField ? { ...editingField, value: e.target.value } : null)}
            placeholder={editingField?.field === 'company_name' ? "Nom de l'entreprise" : "Poste"}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveFieldEdit}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EmailViewDialog
        open={emailViewOpen}
        onOpenChange={setEmailViewOpen}
        letter={viewingLetter}
      />
    </div>
  );
};

export default Dashboard;
