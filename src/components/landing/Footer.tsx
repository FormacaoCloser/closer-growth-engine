import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-border/50 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="text-xl font-display font-bold text-foreground">
            Formação<span className="text-primary">Closer</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/termos" className="hover:text-foreground transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
            <Link to="/contato" className="hover:text-foreground transition-colors">
              Contato
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Formação Closer
          </p>
        </div>
      </div>
    </footer>
  );
}
