import LegalLayout from "@/components/LegalLayout";

const Content = () => (
  <>
    <p>Le site peut utiliser des cookies pour améliorer l’expérience utilisateur.</p>
    <p>L’utilisateur peut accepter ou refuser les cookies via une bannière dédiée.</p>
  </>
);

const Cookies = () => (
  <LegalLayout title="Politique de cookies">
    <Content />
  </LegalLayout>
);

export default Cookies;
