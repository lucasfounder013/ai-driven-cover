import { Button } from "@/components/ui/button";
import { FolderPlus, Folder, FolderOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FoldersBarProps {
  folders: Array<{ id: string; name: string }>;
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onNewFolder: () => void;
}

export const FoldersBar = ({
  folders,
  selectedFolderId,
  onFolderSelect,
  onNewFolder,
}: FoldersBarProps) => {
  return (
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
              Aucun dossier
            </Button>

            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolderId === folder.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onFolderSelect(folder.id)}
                className="gap-2 whitespace-nowrap"
              >
                {selectedFolderId === folder.id ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )}
                {folder.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
