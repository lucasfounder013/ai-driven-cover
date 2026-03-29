import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
