import LegalLayout from "@/components/LegalLayout";

const PolitiqueConfidentialite = () => (
  <LegalLayout title="Politique de confidentialité">
    <h2>1. Données collectées</h2>
    <p>Le site collecte : CV, informations professionnelles, email, données de navigation.</p>

    <h2>2. Finalité</h2>
    <p>Les données sont utilisées pour générer des contenus personnalisés et améliorer le service.</p>

    <h2>3. Base légale</h2>
    <p>Le traitement repose sur le consentement et l'exécution du service.</p>

    <h2>4. Partage des données</h2>
    <p>Les données peuvent être traitées via Anthropic (génération de contenu) et Stripe (paiement). Les données sont conservées pendant la durée strictement nécessaire à la fourniture du service et peuvent être supprimées à tout moment sur demande de l'utilisateur.</p>
    <p>Certaines données peuvent être transférées hors de l'Union européenne, notamment vers des prestataires situés aux États-Unis (ex : Anthropic, Stripe), dans le respect des garanties appropriées.</p>

    <h2>5. Durée de conservation</h2>
    <p>Les données sont conservées uniquement pendant la durée nécessaire au service.</p>

    <h2>6. Droits de l'utilisateur</h2>
    <p>L'utilisateur peut accéder à ses données, les modifier, les supprimer.</p>
    <p>Contact : lbmbusinessfr@gmail.com</p>

    <h2>7. Sécurité</h2>
    <p>Les données sont protégées par des mesures techniques appropriées.</p>
  </LegalLayout>
);

export default PolitiqueConfidentialite;
