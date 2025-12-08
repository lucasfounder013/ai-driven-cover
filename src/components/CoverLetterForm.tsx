import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CVUploadStep } from "./cover-letter-steps/CVUploadStep";
import { JobDetailsStep } from "./cover-letter-steps/JobDetailsStep";
import { GenerationStep } from "./cover-letter-steps/GenerationStep";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import FreeLimitPaywall from "@/components/FreeLimitPaywall";

interface CoverLetterFormProps {
  editingLetter?: any;
  onBack?: () => void;
}

export const CoverLetterForm = ({ editingLetter, onBack }: CoverLetterFormProps) => {
  const navigate = useNavigate();
  const { user, subscriptionStatus } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPath, setCvPath] = useState<string>("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  
  // Free limit tracking
  const [totalGenerations, setTotalGenerations] = useState<number>(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  
  const isFreePlan = !subscriptionStatus.subscribed;
  const isFreeLimitReached = isFreePlan && totalGenerations >= 5;

  useEffect(() => {
    if (editingLetter) {
      setJobTitle(editingLetter.job_title || "");
      setCompanyName(editingLetter.company_name || "");
      setJobDescription(editingLetter.job_description || "");
      setCvPath(editingLetter.cv_text || "");
      setGeneratedLetter(editingLetter.generated_letter || "");
      setCurrentStep(3);
    }
  }, [editingLetter]);

  // Check free limit on mount
  useEffect(() => {
    const checkFreeLimit = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("total_generations_count")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setTotalGenerations(data?.total_generations_count || 0);
      } catch (error) {
        console.error("Error checking free limit:", error);
      } finally {
        setCheckingLimit(false);
      }
    };

    checkFreeLimit();
  }, [user]);

  // If not editing and limit reached, show paywall immediately
  useEffect(() => {
    if (!checkingLimit && !editingLetter && isFreeLimitReached) {
      setShowPaywall(true);
    }
  }, [checkingLimit, editingLetter, isFreeLimitReached]);

  const handlePaywallClose = (open: boolean) => {
    setShowPaywall(open);
    // If closing paywall and limit is reached, go back to dashboard
    if (!open && isFreeLimitReached && !editingLetter) {
      if (onBack) {
        onBack();
      } else {
        navigate("/dashboard");
      }
    }
  };

  const canProceedToStep2 = cvFile !== null;
  const canProceedToStep3 = jobTitle.trim() !== "" && companyName.trim() !== "";

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2) setCurrentStep(2);
    else if (currentStep === 2 && canProceedToStep3) setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCvFile(null);
    setCvPath("");
    setJobTitle("");
    setCompanyName("");
    setJobDescription("");
    setGeneratedLetter("");
    setCurrentStep(1);
  };

  // Show loading while checking limit
  if (checkingLimit) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-8">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        )}

        {/* ✅ STEPPER CENTRÉ & ÉTALÉ */}
        <div className="mb-10 w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center w-full">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold mb-2 ${
                    currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
            ))}
          </div>
        </div>

        {/* ✅ CONTENU CENTRÉ */}
        <div className="min-h-[400px] flex justify-center">
          <div className="w-full max-w-2xl">
            {currentStep === 1 && <CVUploadStep cvFile={cvFile} setCvFile={setCvFile} setCvPath={setCvPath} />}

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
                onReset={handleReset}
                onSave={onBack}
                existingLetterId={editingLetter?.id}
                existingProfileData={editingLetter?.profile_data}
              />
            )}
          </div>
        </div>

        {currentStep < 3 && (
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <Button
              onClick={handleNext}
              disabled={(currentStep === 1 && !canProceedToStep2) || (currentStep === 2 && !canProceedToStep3)}
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </Card>
      
      <FreeLimitPaywall open={showPaywall} onOpenChange={handlePaywallClose} />
    </>
  );
};