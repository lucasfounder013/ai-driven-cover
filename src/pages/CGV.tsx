import LegalLayout from "@/components/LegalLayout";

const CONTENT = () => (
  <>
    <p className="text-muted-foreground italic">COLLER ICI LE CONTENU DES CONDITIONS GÉNÉRALES DE VENTE</p>
    <h2>Article 1 — Objet</h2>
    <p>[Contenu à compléter]</p>
    <h2>Article 2 — Prix et paiement</h2>
    <p>[Contenu à compléter]</p>
    <h2>Article 3 — Abonnement et résiliation</h2>
    <p>[Contenu à compléter]</p>
  </>
);

const CGV = () => (
  <LegalLayout title="Conditions Générales de Vente">
    <CONTENT />
  </LegalLayout>
);

export default CGV;
