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
  return;
};