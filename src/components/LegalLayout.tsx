import Footer from "@/components/Footer";

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

const LegalLayout = ({ title, children }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-10">{title}</h1>
        <div className="prose prose-lg max-w-none text-foreground/90 
          prose-headings:text-foreground prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-p:mb-4
          prose-ul:my-4 prose-li:my-1 prose-a:text-primary prose-a:underline
          dark:prose-invert">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LegalLayout;
