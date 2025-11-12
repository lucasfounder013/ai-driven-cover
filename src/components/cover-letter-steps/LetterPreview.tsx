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
      className="bg-white p-10 rounded-xl max-w-[700px] mx-auto text-[14px] leading-relaxed text-gray-900 shadow-sm border font-[Times]"
      style={{ fontFamily: "Times New Roman, serif" }}
    >
      {/* === HEADER === */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold tracking-wide">{name}</h1>
        <p className="italic text-sm text-gray-700">{subtitle}</p>
        <p className="text-sm text-gray-700 mt-1">{contact}</p>
      </div>

      {/* === TITLE === */}
      <div className="text-center mb-6">
        <h2 className="font-bold text-base">
          Stage – {jobTitle} ({companyName})
        </h2>
      </div>

      {/* === BODY (editable) === */}
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setGeneratedLetter((e.target as HTMLElement).innerText)}
        className="whitespace-pre-line text-justify focus:outline-none min-h-[400px]"
      />

      {/* === SIGNATURE === */}
      <div className="mt-8">
        <p className="mt-2 font-semibold">{name}</p>
      </div>
    </div>
  );
};
