import LegalLayout from "@/components/LegalLayout";

const Content = () => (
  <>
    <h2>1. Accès au service</h2>
    <p>Le site est accessible à tout utilisateur disposant d’un accès internet.</p>

    <h2>2. Utilisation</h2>
    <p>
      L’utilisateur s’engage à fournir des informations exactes et à ne pas utiliser le service à des fins illégales.
    </p>
    <p>L’utilisateur s’engage notamment à ne pas :</p>
    <ul className="list-disc pl-6 space-y-2">
      <li>utiliser le service à des fins frauduleuses ;</li>
      <li>tenter d’accéder aux systèmes techniques du site ;</li>
      <li>revendre ou exploiter commercialement les contenus générés sans autorisation.</li>
    </ul>
    <p>
      L’éditeur se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes conditions.
    </p>

    <h2>3. Compte utilisateur</h2>
    <p>
      Certaines fonctionnalités nécessitent la création d’un compte. L’utilisateur est responsable de ses identifiants.
    </p>

    <h2>4. Contenus générés</h2>
    <p>
      Les contenus sont générés automatiquement par intelligence artificielle. Ils doivent être vérifiés et adaptés
      avant utilisation.
    </p>

    <h2>5. Limitation de responsabilité</h2>
    <p>L’éditeur ne garantit pas l’exactitude des contenus ni les résultats obtenus.</p>

    <h2>6. Suspension</h2>
    <p>Le service peut être suspendu en cas d’abus.</p>

    <h2>7. Modification</h2>
    <p>Les présentes Conditions Générales d’Utilisation peuvent être modifiées à tout moment.</p>
  </>
);

const CGU = () => (
  <LegalLayout title="Conditions Générales d'Utilisation">
    <Content />
  </LegalLayout>
);

export default CGU;
