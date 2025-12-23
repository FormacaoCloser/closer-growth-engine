import { Button } from '@/components/ui/button';
import { Shield, Zap, Users } from 'lucide-react';
import { CMSContent, getCMSValue } from '@/hooks/useCMSContent';

interface CTASectionProps {
  content?: CMSContent[];
  onCTAClick: () => void;
}

export function CTASection({ content, onCTAClick }: CTASectionProps) {
  // Get CMS values with fallbacks
  const title = getCMSValue(content, 'cta_title', 'Comece sua jornada como <span class="text-gradient">Closer</span>');
  const buttonText = getCMSValue(content, 'cta_button_text', 'Matricule-se Agora');
  const feature1 = getCMSValue(content, 'cta_feature1', 'Acesso imediato');
  const feature2 = getCMSValue(content, 'cta_feature2', 'Garantia de 7 dias');
  const feature3 = getCMSValue(content, 'cta_feature3', 'Suporte exclusivo');
  const guaranteeText = getCMSValue(content, 'cta_guarantee_text', 'Se você não gostar por qualquer motivo, devolvemos 100% do seu dinheiro em até 7 dias.');

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />
      
      <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
        {/* Title */}
        <h2 
          className="text-3xl md:text-4xl font-display font-bold text-foreground"
          dangerouslySetInnerHTML={{ __html: title }}
        />

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>{feature1}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>{feature2}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>{feature3}</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Button 
            size="lg" 
            className="btn-cta text-lg px-10 py-7"
            onClick={onCTAClick}
          >
            {buttonText}
          </Button>
        </div>

        {/* Guarantee Text */}
        <p className="text-sm text-muted-foreground">
          {guaranteeText}
        </p>
      </div>
    </section>
  );
}
