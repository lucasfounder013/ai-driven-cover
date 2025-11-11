import { useEffect, useRef } from "react";

interface LetterPreviewProps {
  profileData: any;
  jobTitle: string;
  companyName: string;
  generatedLetter: string;
  setGeneratedLetter: (letter: string) => void;
}

export const LetterPreview = ({
  profileData,
  jobTitle,
  companyName,
  generatedLetter,
  setGeneratedLetter,
}: LetterPreviewProps) => {
  const editableRef = useRef<HTMLDivElement>(null);

  // synchronise le contenu quand la lettre change
  useEffect(() => {
    if (editableRef.current && generatedLetter) {
      editableRef.current.innerText = generatedLetter;
    }
  }, [generatedLetter]);

  const name = `${profileData?.first_name?.toUpperCase() || "NOM"} ${profileData?.last_name?.toUpperCase() || "PRÉNOM"}`;
  const subtitle = "Stage de 6 mois à partir de Février 2026";
  const contact = [profileData?.phone_number, profileData?.professional_email, profileData?.linkedin_url]
    .filter(Boolean)
    .join(" • ");

  return (
    <div
      id="letter-preview"
      className="bg-white p-10 rounded-xl max-w-[700px] mx-auto text-[14px] font-[Times] leading-relaxed text-gray-800 shadow-sm border focus-within:ring-2 focus-within:ring-primary"
      style={{ fontFamily: "Times New Roman, serif" }}
    >
      {/* En-tête */}
      <div className="text-center border-b border-gray-300 pb-3 mb-6">
        <p className="text-gray-600 text-sm">{contact}</p>
        <h1 className="text-2xl font-bold text-black mt-2">{name}</h1>
        <p className="text-gray-700 text-base italic mt-1">{subtitle}</p>
      </div>

      {/* Titre */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold underline">
          Stage – {jobTitle} ({companyName})
        </h2>
      </div>

      {/* Corps de la lettre — éditable */}
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setGeneratedLetter((e.target as HTMLElement).innerText)}
        className="whitespace-pre-line focus:outline-none"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
};
