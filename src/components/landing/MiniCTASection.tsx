import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { CMSContent, getCMSValue } from '@/hooks/useCMSContent';

interface MiniCTASectionProps {
  content?: CMSContent[];
  onCTAClick: () => void;
}

export function MiniCTASection({ content, onCTAClick }: MiniCTASectionProps) {
  const buttonText = getCMSValue(content, 'mini_cta_button', 'Quero Começar Agora');
  const subtext = getCMSValue(content, 'mini_cta_subtext', 'Acesso imediato • Garantia de 7 dias');

  return (
    <section className="py-12 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <Button 
          size="lg" 
          className="btn-cta text-lg px-8 py-6 group"
          onClick={onCTAClick}
        >
          {buttonText}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-sm text-muted-foreground">
          {subtext}
        </p>
      </div>
    </section>
  );
}
