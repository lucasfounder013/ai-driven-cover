import { useEffect, useRef, useState } from "react";

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editableRef.current && generatedLetter && !isInitialized) {
      editableRef.current.innerText = generatedLetter;
      setIsInitialized(true);
    }
  }, [generatedLetter, isInitialized]);

  const name = `${profileData?.first_name?.toUpperCase() || "NOM"} ${profileData?.last_name?.toUpperCase() || "PRÉNOM"}`;
  
  // Construire le sous-titre dynamiquement à partir du profil
  const durationMin = profileData?.duration_min;
  const durationMax = profileData?.duration_max;
  const availableFrom = profileData?.available_from;
  
  let durationText = "";
  if (durationMin && durationMax) {
    if (durationMin === durationMax) {
      durationText = `${durationMin} mois`;
    } else {
      durationText = `${durationMin} à ${durationMax} mois`;
    }
  } else if (durationMin) {
    durationText = `${durationMin} mois`;
  }
  
  const subtitle = `${profileData?.desired_position || "Stage"}${durationText ? ` de ${durationText}` : ""}${availableFrom ? ` à partir de ${availableFrom}` : ""}`;
  
  const contact = [profileData?.phone_number, profileData?.professional_email, profileData?.linkedin_url]
    .filter(Boolean)
    .join(" • ");
  
  // Éviter la duplication si jobTitle commence déjà par "Stage" ou "STAGE"
  const formattedTitle = jobTitle.trim().match(/^stage\s*[-–]?\s*/i) 
    ? jobTitle 
    : `Stage – ${jobTitle}`;

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
          {formattedTitle} ({companyName})
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
