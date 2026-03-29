import LegalLayout from "@/components/LegalLayout";

const CGV = () => (
  <LegalLayout title="Conditions Générales de Vente">
    <h2>1. Objet</h2>
    <p>Les présentes CGV régissent les ventes de services numériques proposés sur le site jobboost.fr.</p>

    <h2>2. Description du service</h2>
    <p>JobBoost permet de générer automatiquement : lettres de motivation et emails de candidature à partir des informations fournies par l'utilisateur.</p>

    <h2>3. Prix</h2>
    <p>Les prix sont indiqués en euros. Le service propose : une version gratuite limitée et des abonnements payants (hebdomadaire / mensuel).</p>

    <h2>4. Abonnement</h2>
    <p>Les abonnements sont à reconduction automatique. L'utilisateur peut résilier à tout moment depuis son compte ou via Stripe.</p>
    <p>L'abonnement est reconduit automatiquement à chaque échéance, sauf résiliation par l'utilisateur avant la date de renouvellement.</p>
    <p>Toute période entamée est due et ne peut donner lieu à remboursement.</p>
    <p>L'éditeur se réserve le droit de suspendre ou de limiter l'accès au service en cas d'utilisation abusive ou frauduleuse.</p>

    <h2>5. Paiement</h2>
    <p>Les paiements sont sécurisés via Stripe. Les informations bancaires ne sont pas stockées par le site.</p>

    <h2>6. Droit de rétractation</h2>
    <p>Conformément à la législation :</p>
    <p>L'utilisateur accepte que le service commence immédiatement après paiement et renonce expressément à son droit de rétractation.</p>

    <h2>7. Responsabilité</h2>
    <p>Le service repose sur de l'intelligence artificielle. Les contenus générés peuvent contenir des erreurs et ne garantissent aucun résultat (ex : obtention d'un emploi).</p>
    <p>L'éditeur ne peut être tenu responsable de l'usage des contenus.</p>

    <h2>8. Résiliation</h2>
    <p>L'utilisateur peut résilier son abonnement à tout moment. La résiliation prend effet à la fin de la période en cours.</p>

    <h2>9. Litiges</h2>
    <p>Le droit applicable est le droit français.</p>
  </LegalLayout>
);

export default CGV;
