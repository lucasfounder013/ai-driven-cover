import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} JobBoost. Tous droits réservés.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
            <Link to="/cgv" className="hover:text-foreground transition-colors">CGV</Link>
            <Link to="/cgu" className="hover:text-foreground transition-colors">CGU</Link>
            <Link to="/politique-confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
