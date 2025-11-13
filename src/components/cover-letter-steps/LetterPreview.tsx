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
  
  // Formater la date au format français
  let formattedDate = "";
  if (availableFrom) {
    try {
      const date = new Date(availableFrom);
      formattedDate = format(date, "MMMM yyyy", { locale: fr });
      // Capitaliser la première lettre
      formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    } catch (e) {
      formattedDate = availableFrom;
    }
  }
  
  const subtitle = `${profileData?.desired_position || "Stage"}${durationText ? ` de ${durationText}` : ""}${formattedDate ? ` à partir de ${formattedDate}` : ""}`;
  
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
      {/* === HEADER (editable) === */}
      <div className="text-center mb-4">
        <div className="text-xl font-bold tracking-wide flex justify-center gap-2">
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setProfileData({ ...profileData, first_name: (e.target as HTMLElement).innerText })}
            className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
          >
            {profileData?.first_name?.toUpperCase() || "NOM"}
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setProfileData({ ...profileData, last_name: (e.target as HTMLElement).innerText })}
            className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
          >
            {profileData?.last_name?.toUpperCase() || "PRÉNOM"}
          </div>
        </div>
        
        <div className="italic text-sm text-gray-700 flex justify-center gap-1 flex-wrap">
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setProfileData({ ...profileData, desired_position: (e.target as HTMLElement).innerText })}
            className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
          >
            {profileData?.desired_position || "Stage"}
          </div>
          {durationText && (
            <>
              <span>de</span>
              <div className="flex gap-1">
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    const val = parseInt((e.target as HTMLElement).innerText) || "";
                    setProfileData({ ...profileData, duration_min: val });
                  }}
                  className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                >
                  {profileData?.duration_min || ""}
                </div>
                {durationMin !== durationMax && (
                  <>
                    <span>à</span>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => {
                        const val = parseInt((e.target as HTMLElement).innerText) || "";
                        setProfileData({ ...profileData, duration_max: val });
                      }}
                      className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                    >
                      {profileData?.duration_max || ""}
                    </div>
                  </>
                )}
                <span>mois</span>
              </div>
            </>
          )}
          {formattedDate && (
            <>
              <span>à partir de</span>
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setProfileData({ ...profileData, available_from: (e.target as HTMLElement).innerText })}
                className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
              >
                {formattedDate}
              </div>
            </>
          )}
        </div>
        
        <div className="text-sm text-gray-700 mt-1 flex justify-center gap-1 flex-wrap">
          {profileData?.phone_number && (
            <>
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setProfileData({ ...profileData, phone_number: (e.target as HTMLElement).innerText })}
                className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
              >
                {profileData.phone_number}
              </div>
              <span>•</span>
            </>
          )}
          {profileData?.professional_email && (
            <>
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setProfileData({ ...profileData, professional_email: (e.target as HTMLElement).innerText })}
                className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
              >
                {profileData.professional_email}
              </div>
              {profileData?.linkedin_url && <span>•</span>}
            </>
          )}
          {profileData?.linkedin_url && (
            <div
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setProfileData({ ...profileData, linkedin_url: (e.target as HTMLElement).innerText })}
              className="focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
            >
              {profileData.linkedin_url}
            </div>
          )}
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
