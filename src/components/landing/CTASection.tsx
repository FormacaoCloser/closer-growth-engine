import { Button } from '@/components/ui/button';
import { Shield, Zap, Users } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />
      
      <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Comece sua jornada como{' '}
          <span className="text-gradient">Closer</span>
        </h2>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>Acesso imediato</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Garantia de 7 dias</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>Suporte exclusivo</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Button 
            size="lg" 
            className="btn-cta text-lg px-10 py-7"
            onClick={() => window.location.href = '/checkout'}
          >
            Matricule-se Agora
          </Button>
        </div>

        {/* Guarantee Text */}
        <p className="text-sm text-muted-foreground">
          Se você não gostar por qualquer motivo, devolvemos 100% do seu dinheiro em até 7 dias.
        </p>
      </div>
    </section>
  );
}
