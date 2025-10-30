import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface JobDetailsStepProps {
  jobTitle: string;
  setJobTitle: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
}

export const JobDetailsStep = ({
  jobTitle,
  setJobTitle,
  companyName,
  setCompanyName,
  jobDescription,
  setJobDescription,
}: JobDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Détails du poste
        </h2>
        <p className="text-muted-foreground">
          Renseignez les informations sur le poste visé
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">
            Intitulé du poste <span className="text-destructive">*</span>
          </Label>
          <Input
            id="jobTitle"
            placeholder="Ex: Développeur Full Stack"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">
            Nom de l'entreprise <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="Ex: Tech Company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobDescription">
            Description du poste (optionnel)
          </Label>
          <Textarea
            id="jobDescription"
            placeholder="Décrivez les responsabilités, compétences requises, etc."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
      </div>
    </div>
  );
};
