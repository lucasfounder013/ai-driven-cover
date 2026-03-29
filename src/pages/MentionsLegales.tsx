import LegalLayout from "@/components/LegalLayout";

const CONTENT = () => (
  <>
    <p className="text-muted-foreground italic">COLLER ICI LE CONTENU DES MENTIONS LÉGALES</p>
    <h2>Éditeur du site</h2>
    <p>[Nom / Raison sociale]<br />[Adresse]<br />[Email de contact]<br />[Numéro SIRET]</p>
    <h2>Hébergement</h2>
    <p>[Nom de l'hébergeur]<br />[Adresse de l'hébergeur]</p>
    <h2>Directeur de la publication</h2>
    <p>[Nom du directeur de la publication]</p>
  </>
);

const MentionsLegales = () => (
  <LegalLayout title="Mentions légales">
    <CONTENT />
  </LegalLayout>
);

export default MentionsLegales;
