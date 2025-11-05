import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CVUploadStep } from "./cover-letter-steps/CVUploadStep";
import { JobDetailsStep } from "./cover-letter-steps/JobDetailsStep";
import { GenerationStep } from "./cover-letter-steps/GenerationStep";

export const CoverLetterForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPath, setCvPath] = useState<string>("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");

  const canProceedToStep2 = cvFile !== null;
  const canProceedToStep3 = jobTitle.trim() !== "" && companyName.trim() !== "";

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setCvFile(null);
    setCvPath("");
    setJobTitle("");
    setCompanyName("");
    setJobDescription("");
    setGeneratedLetter("");
    // Recharger la page pour revenir au dashboard
    window.location.reload();
  };

  return (
    <Card className="p-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                <span className="text-sm text-muted-foreground text-center">
                  {step === 1 && "Télécharger le CV"}
                  {step === 2 && "Détails du poste"}
                  {step === 3 && "Génération"}
                </span>
              </div>
              {step < 3 && (
                <div
                  className={`h-1 w-full ${
                    currentStep > step ? "bg-primary" : "bg-muted"
                  }`}
                  style={{ marginTop: "-20px" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <CVUploadStep 
            cvFile={cvFile} 
            setCvFile={setCvFile}
            setCvPath={setCvPath}
          />
        )}
        {currentStep === 2 && (
          <JobDetailsStep
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            companyName={companyName}
            setCompanyName={setCompanyName}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
          />
        )}
        {currentStep === 3 && (
          <GenerationStep
            cvPath={cvPath}
            jobTitle={jobTitle}
            companyName={companyName}
            jobDescription={jobDescription}
            generatedLetter={generatedLetter}
            setGeneratedLetter={setGeneratedLetter}
            onReset={resetForm}
          />
        )}
      </div>

      {currentStep < 3 && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !canProceedToStep2) ||
              (currentStep === 2 && !canProceedToStep3)
            }
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </Card>
  );
};
