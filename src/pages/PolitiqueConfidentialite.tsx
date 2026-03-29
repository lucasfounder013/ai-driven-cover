import LegalLayout from "@/components/LegalLayout";

const CONTENT = () => (
  <>
    <p className="text-muted-foreground italic">COLLER ICI LE CONTENU DE LA POLITIQUE DE CONFIDENTIALITÉ</p>
    <h2>Données collectées</h2>
    <p>[Contenu à compléter]</p>
    <h2>Finalités du traitement</h2>
    <p>[Contenu à compléter]</p>
    <h2>Durée de conservation</h2>
    <p>[Contenu à compléter]</p>
    <h2>Vos droits</h2>
    <p>[Contenu à compléter]</p>
  </>
);

const PolitiqueConfidentialite = () => (
  <LegalLayout title="Politique de confidentialité">
    <CONTENT />
  </LegalLayout>
);

export default PolitiqueConfidentialite;
