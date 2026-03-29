import LegalLayout from "@/components/LegalLayout";

const CONTENT = () => (
  <>
    <p className="text-muted-foreground italic">COLLER ICI LE CONTENU DE LA POLITIQUE DE COOKIES</p>
    <h2>Qu'est-ce qu'un cookie ?</h2>
    <p>[Contenu à compléter]</p>
    <h2>Cookies utilisés</h2>
    <p>[Contenu à compléter]</p>
    <h2>Gestion des cookies</h2>
    <p>[Contenu à compléter]</p>
  </>
);

const Cookies = () => (
  <LegalLayout title="Politique de cookies">
    <CONTENT />
  </LegalLayout>
);

export default Cookies;
