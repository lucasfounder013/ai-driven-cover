import LegalLayout from "@/components/LegalLayout";

const CONTENT = () => (
  <>
    <p className="text-muted-foreground italic">COLLER ICI LE CONTENU DES CONDITIONS GÉNÉRALES D'UTILISATION</p>
    <h2>Article 1 — Objet</h2>
    <p>[Contenu à compléter]</p>
    <h2>Article 2 — Accès au service</h2>
    <p>[Contenu à compléter]</p>
    <h2>Article 3 — Responsabilités de l'utilisateur</h2>
    <p>[Contenu à compléter]</p>
  </>
);

const CGU = () => (
  <LegalLayout title="Conditions Générales d'Utilisation">
    <CONTENT />
  </LegalLayout>
);

export default CGU;
