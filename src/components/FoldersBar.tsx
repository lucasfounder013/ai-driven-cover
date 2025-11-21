import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, Folder, FolderOpen, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface FoldersBarProps {
  folders: Array<{ id: string; name: string }>;
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onNewFolder: () => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export const FoldersBar = ({
  folders,
  selectedFolderId,
  onFolderSelect,
  onNewFolder,
  onRenameFolder,
  onDeleteFolder,
}: FoldersBarProps) => {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmFolderId, setDeleteConfirmFolderId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingFolderId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingFolderId]);

  const handleStartEdit = (folder: { id: string; name: string }) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const handleSaveEdit = () => {
    if (editingFolderId && editingName.trim() && editingName.trim() !== folders.find(f => f.id === editingFolderId)?.name) {
      onRenameFolder(editingFolderId, editingName.trim());
    }
    setEditingFolderId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleDeleteClick = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmFolderId(folderId);
  };

  const confirmDelete = () => {
    if (deleteConfirmFolderId) {
      onDeleteFolder(deleteConfirmFolderId);
      setDeleteConfirmFolderId(null);
    }
  };

  return (
    <>
      <div className="border-b bg-card">
        <div className="flex items-center gap-2 p-4">
          <Button onClick={onNewFolder} size="sm" className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Nouveau dossier
          </Button>

          <ScrollArea className="flex-1">
            <div className="flex items-center gap-2">
              <Button
                variant={selectedFolderId === null ? "default" : "ghost"}
                size="sm"
                onClick={() => onFolderSelect(null)}
                className="gap-2 whitespace-nowrap"
              >
                <Folder className="h-4 w-4" />
                Lettres non classées
              </Button>

              {folders.map((folder) => {
                const isSelected = selectedFolderId === folder.id;
                const isEditing = editingFolderId === folder.id;

                return (
                  <div key={folder.id} className="flex items-center gap-1 group">
                    {isEditing ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary rounded-md">
                        <FolderOpen className="h-4 w-4 text-primary-foreground flex-shrink-0" />
                        <Input
                          ref={inputRef}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={handleKeyDown}
                          className="h-6 px-2 py-0 text-sm bg-background border-none focus-visible:ring-1 focus-visible:ring-ring min-w-[120px]"
                        />
                      </div>
                    ) : (
                      <>
                        <Button
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              handleStartEdit(folder);
                            } else {
                              onFolderSelect(folder.id);
                            }
                          }}
                          className="gap-2 whitespace-nowrap"
                        >
                          {isSelected ? (
                            <FolderOpen className="h-4 w-4" />
                          ) : (
                            <Folder className="h-4 w-4" />
                          )}
                          {folder.name}
                        </Button>
                        {isSelected && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(folder.id, e)}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Supprimer le dossier"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      <AlertDialog open={deleteConfirmFolderId !== null} onOpenChange={(open) => !open && setDeleteConfirmFolderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce dossier ? Les lettres qu'il contient seront déplacées vers "Lettres non classées".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
