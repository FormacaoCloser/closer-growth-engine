import { SmartVideoPlayer } from './SmartVideoPlayer';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  displayProgress: number;
  isPlaying: boolean;
  hasUnlocked: boolean;
  onPlayPause: (playing: boolean) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onScrollToContent: () => void;
  onCTAClick: () => void;
}

export function HeroSection({
  displayProgress,
  isPlaying,
  hasUnlocked,
  onPlayPause,
  onTimeUpdate,
  onScrollToContent,
  onCTAClick,
}: HeroSectionProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-primary font-medium">Nova Profissão em Alta</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
          Descubra a Profissão que Paga de{' '}
          <span className="text-gradient">R$10 a R$30 Mil</span>{' '}
          por Mês
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Trabalhe de casa, cerca de 4 horas por dia, em um mercado em explosão 
          que as universidades ainda não ensinam.
        </p>

        {/* Video Player */}
        <div className="w-full max-w-3xl mx-auto mt-8">
          <SmartVideoPlayer
            videoUrl="https://formacaocloser.b-cdn.net/copy_64B2EF33-32DD-4816-8FD5-D93AEEABCB23.mp4"
            displayProgress={displayProgress}
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onTimeUpdate={onTimeUpdate}
          />
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Button 
            size="lg" 
            className="btn-cta text-lg px-8 py-6"
            onClick={onCTAClick}
          >
            Matricule-se Agora
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Acesso imediato • Garantia de 7 dias
          </p>
        </div>

      </div>
    </section>
  );
}
