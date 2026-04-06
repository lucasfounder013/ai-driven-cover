import LegalLayout from "@/components/LegalLayout";

const Content = () => (
  <>
    <h2>1. Données collectées</h2>
    <p>
      Le site collecte les données suivantes : CV, informations professionnelles, adresse email ainsi que des données de
      navigation.
    </p>

    <h2>2. Finalité du traitement</h2>
    <p>Les données sont utilisées pour générer des contenus personnalisés et améliorer le service.</p>

    <h2>3. Base légale</h2>
    <p>Le traitement des données repose sur le consentement de l’utilisateur et l’exécution du service.</p>

    <h2>4. Partage des données</h2>
    <p>
      Les données peuvent être traitées via des prestataires tiers tels qu’Anthropic (génération de contenu) et Stripe
      (paiement).
    </p>
    <p>
      Certaines données peuvent être transférées hors de l’Union européenne, notamment vers des prestataires situés aux
      États-Unis, dans le respect des garanties appropriées.
    </p>

    <h2>5. Durée de conservation</h2>
    <p>Les données sont conservées uniquement pendant la durée nécessaire à la fourniture du service.</p>

    <h2>6. Droits de l’utilisateur</h2>
    <p>L’utilisateur dispose d’un droit d’accès, de modification et de suppression de ses données.</p>
    <p>Pour toute demande : lbmbusinessfr@gmail.com</p>

    <h2>7. Sécurité</h2>
    <p>Les données sont protégées par des mesures techniques appropriées.</p>
  </>
);

const PolitiqueConfidentialite = () => (
  <LegalLayout title="Politique de confidentialité">
    <Content />
  </LegalLayout>
);

export default PolitiqueConfidentialite;
