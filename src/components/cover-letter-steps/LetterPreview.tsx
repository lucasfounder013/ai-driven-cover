import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface LetterPreviewProps {
  profileData: any;
  setProfileData: (data: any) => void;
  jobTitle: string;
  companyName: string;
  generatedLetter: string;
  setGeneratedLetter: (letter: string) => void;
}

export const LetterPreview = ({
  profileData,
  setProfileData,
  jobTitle,
  companyName,
  generatedLetter,
  setGeneratedLetter,
}: LetterPreviewProps) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  //
  // ========= Construire les valeurs affichées =========
  //
  const name = `${profileData?.first_name?.toUpperCase() || "NOM"} ${profileData?.last_name?.toUpperCase() || "PRÉNOM"}`;

  const min = profileData?.duration_min;
  const max = profileData?.duration_max;

  let duration = "";
  if (min && max) duration = min === max ? `${min} mois` : `${min} à ${max} mois`;
  else if (min) duration = `${min} mois`;

  let startDate = "";
  if (profileData?.available_from) {
    try {
      const d = new Date(profileData.available_from);
      startDate = format(d, "MMMM yyyy", { locale: fr });
      startDate = startDate.charAt(0).toUpperCase() + startDate.slice(1);
    } catch {
      startDate = profileData.available_from;
    }
  }

  const subtitle =
    `${profileData?.desired_position || "Stage"}` +
    (duration ? ` de ${duration}` : "") +
    (startDate ? ` à partir de ${startDate}` : "");

  const contact = [profileData?.phone_number, profileData?.professional_email, profileData?.linkedin_url]
    .filter(Boolean)
    .join(" • ");

  const formattedTitle = jobTitle || "Intitulé du stage";

  //
  // ========= Initialiser le corps du texte =========
  //
  useEffect(() => {
    if (editableRef.current && generatedLetter && !isInitialized) {
      editableRef.current.innerText = generatedLetter;
      setIsInitialized(true);
    }
  }, [generatedLetter, isInitialized]);

  //
  // ========= Render =========
  //

  return (
    <div
      id="letter-preview"
      className="bg-white p-10 rounded-xl max-w-[700px] mx-auto text-[14px] leading-relaxed text-gray-900 shadow-sm border"
      style={{ fontFamily: "Times New Roman, serif" }}
    >
      {/* === HEADER STRUCTURÉ EN 4 LIGNES === */}
      <div className="text-center mb-8 space-y-1">
        {/* Nom */}
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            const parts = (e.target as HTMLElement).innerText.trim().split(" ");
            setProfileData({
              ...profileData,
              first_name: parts[0] || "",
              last_name: parts.slice(1).join(" ") || "",
            });
          }}
          className="text-xl font-bold tracking-wide focus:outline-none"
        >
          {name}
        </div>

        {/* Sous-titre */}
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            const text = (e.target as HTMLElement).innerText.trim();
            setProfileData({
              ...profileData,
              desired_position: text.split(" de ")[0],
            });
          }}
          className="text-sm italic text-gray-600 focus:outline-none"
        >
          {subtitle}
        </div>

        {/* Contacts */}
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => {
            const parts = (e.target as HTMLElement).innerText.split("•").map((p) => p.trim());
            setProfileData({
              ...profileData,
              phone_number: parts[0] || "",
              professional_email: parts[1] || "",
              linkedin_url: parts[2] || "",
            });
          }}
          className="text-sm text-gray-600 focus:outline-none"
        >
          {contact}
        </div>

        {/* Intitulé du stage */}
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={() => {}}
          className="text-base font-bold mt-3 focus:outline-none"
        >
          {`${formattedTitle} (${companyName})`}
        </div>
      </div>

      {/* === CORPS DE LA LETTRE === */}
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setGeneratedLetter((e.target as HTMLElement).innerText)}
        className="whitespace-pre-line text-justify focus:outline-none min-h-[400px]"
      ></div>

      {/* === SIGNATURE === */}
      <div className="mt-8">
        <p className="font-semibold">{name}</p>
      </div>
    </div>
  );
};
