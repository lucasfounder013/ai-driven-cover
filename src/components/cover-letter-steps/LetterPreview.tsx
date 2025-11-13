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
  const headerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  //
  // ============================================================
  // 1. Construction du texte d’en-tête (affichage)
  // ============================================================
  //

  const name = `${profileData?.first_name?.toUpperCase() || "NOM"} ${profileData?.last_name?.toUpperCase() || "PRÉNOM"}`;

  // Durée
  const min = profileData?.duration_min;
  const max = profileData?.duration_max;
  let duration = "";
  if (min && max) duration = min === max ? `${min} mois` : `${min} à ${max} mois`;
  else if (min) duration = `${min} mois`;

  // Date
  let startDate = "";
  if (profileData?.available_from) {
    try {
      const date = new Date(profileData.available_from);
      startDate = format(date, "MMMM yyyy", { locale: fr });
      startDate = startDate.charAt(0).toUpperCase() + startDate.slice(1);
    } catch {
      startDate = profileData.available_from;
    }
  }

  const subtitle = `${profileData?.desired_position || "Stage"}${duration ? ` de ${duration}` : ""}${startDate ? ` à partir de ${startDate}` : ""}`;

  const contact = [profileData?.phone_number, profileData?.professional_email, profileData?.linkedin_url]
    .filter(Boolean)
    .join(" • ");

  // Titre du poste
  const formattedTitle = jobTitle.trim().match(/^stage\s*[-–]?\s*/i) ? jobTitle : `Stage – ${jobTitle}`;

  //
  // ============================================================
  // 2. Header textuel (unique contentEditable)
  // ============================================================
  //

  const headerText = `${name}
${subtitle}
${contact}`;

  //
  // ============================================================
  // 3. Parser le header pour mettre à jour le state
  // ============================================================
  //

  const parseHeader = () => {
    if (!headerRef.current) return;

    const text = headerRef.current.innerText;
    const lines = text.split("\n").map((l) => l.trim());

    const line1 = lines[0] || "";
    const line2 = lines[1] || "";
    const line3 = lines[2] || "";

    // Extraction simple et robuste
    const [first_name = "", last_name = ""] = line1.split(" ");

    const phone = line3.match(/[0-9\s\+\-\.]{8,}/)?.[0] || "";
    const email = line3.match(/[^\s]+@[^\s]+/)?.[0] || "";
    const linkedin = line3.includes("linkedin")
      ? line3
          .split("•")
          .find((x) => x.includes("linkedin"))
          ?.trim()
      : profileData.linkedin_url;

    // Extraction date
    let extractedDate = profileData.available_from;
    const dateRegex = /(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}/i;
    const foundDate = line2.match(dateRegex);
    if (foundDate) extractedDate = foundDate[0];

    // Extraction durée
    let extractedMin = profileData.duration_min;
    let extractedMax = profileData.duration_max;
    const durationRegex = /(\d+)\s*(?:à|-)\s*(\d+)\s*mois/i;
    const singleDurationRegex = /(\d+)\s*mois/;

    const range = line2.match(durationRegex);
    if (range) {
      extractedMin = Number(range[1]);
      extractedMax = Number(range[2]);
    } else {
      const single = line2.match(singleDurationRegex);
      if (single) {
        extractedMin = Number(single[1]);
        extractedMax = Number(single[1]);
      }
    }

    setProfileData({
      ...profileData,
      first_name: first_name.toUpperCase(),
      last_name: last_name.toUpperCase(),
      desired_position: line2.split(" de ")[0] || profileData.desired_position,
      duration_min: extractedMin,
      duration_max: extractedMax,
      available_from: extractedDate,
      phone_number: phone,
      professional_email: email,
      linkedin_url: linkedin,
    });
  };

  //
  // ============================================================
  // 4. Initialisation du corps de lettre
  // ============================================================
  //

  useEffect(() => {
    if (editableRef.current && generatedLetter && !isInitialized) {
      editableRef.current.innerText = generatedLetter;
      setIsInitialized(true);
    }
  }, [generatedLetter, isInitialized]);

  //
  // ============================================================
  // 5. Render
  // ============================================================
  //

  return (
    <div
      id="letter-preview"
      className="bg-white p-10 rounded-xl max-w-[700px] mx-auto text-[14px] leading-relaxed text-gray-900 shadow-sm border font-[Times]"
      style={{ fontFamily: "Times New Roman, serif" }}
    >
      {/* === HEADER (unique bloc editable) === */}
      <div className="text-center mb-6">
        <div
          ref={headerRef}
          contentEditable
          suppressContentEditableWarning
          onInput={parseHeader}
          className="focus:outline-none focus:ring-1 focus:ring-primary rounded p-2 whitespace-pre-line"
        >
          {headerText}
        </div>
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
