import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AssistantSection from "@/components/AssistantSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import LetterExampleSection from "@/components/LetterExampleSection";
import FinalCTASection from "@/components/FinalCTASection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorksSection />
      <AssistantSection />
      <WhyChooseSection />
      <LetterExampleSection />
      <FinalCTASection />
    </div>
  );
};

export default Index;
