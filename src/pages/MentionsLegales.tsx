import LegalLayout from "@/components/LegalLayout";

const Content = () => (
  <>
    <h2>Éditeur du site</h2>
    <p>Le présent site, accessible à l’adresse jobboost.fr, est édité par :</p>
    <p>
      Lucas LE DONNE, entrepreneur individuel (micro-entreprise)
      <br />
      Exerçant sous le nom commercial LBM
      <br />
      Adresse : 100 rue Baudin, 92300 Levallois-Perret, France
      <br />
      Email : lbmbusinessfr@gmail.com
      <br />
      Téléphone : +33 6 20 96 21 85
      <br />
      Numéro SIRET : 99395382700017
    </p>

    <h2>Directeur de la publication</h2>
    <p>Lucas LE DONNE</p>

    <h2>Hébergement</h2>
    <p>Le site est hébergé par :</p>
    <p>
      Lovable Labs Incorporated
      <br />
      1111b South Governors Avenue
      <br />
      Dover, DE 19904
      <br />
      États-Unis
    </p>

    <h2>Activité</h2>
    <p>
      Le site propose un service numérique permettant de générer des contenus de candidature (lettres de motivation,
      emails) à l’aide d’intelligence artificielle.
    </p>

    <h2>Propriété intellectuelle</h2>
    <p>
      Tous les éléments du site sont protégés par le droit de la propriété intellectuelle. Toute reproduction sans
      autorisation est interdite.
    </p>

    <h2>Responsabilité</h2>
    <p>
      Les contenus générés sont produits automatiquement par intelligence artificielle. Ils sont fournis à titre
      indicatif et peuvent contenir des erreurs. L’utilisateur est seul responsable de l’usage qu’il en fait.
    </p>
  </>
);

const MentionsLegales = () => (
  <LegalLayout title="Mentions légales">
    <Content />
  </LegalLayout>
);

export default MentionsLegales;
