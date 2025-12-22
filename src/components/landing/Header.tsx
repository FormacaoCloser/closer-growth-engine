import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, isAdmin } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-display font-bold text-foreground">
          Formação<span className="text-primary">Closer</span>
        </Link>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild variant="outline" size="sm">
              <Link to={isAdmin() ? '/admin' : '/aluno'}>
                {isAdmin() ? 'Painel Admin' : 'Área do Aluno'}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
