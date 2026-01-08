import { SmartVideoPlayer } from './SmartVideoPlayer';
import { Button } from '@/components/ui/button';
import { CMSContent, getCMSValue } from '@/hooks/useCMSContent';

interface HeroSectionProps {
  content?: CMSContent[];
  displayProgress: number;
  isPlaying: boolean;
  hasUnlocked: boolean;
  onPlayPause: (playing: boolean) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onScrollToContent: () => void;
  onCTAClick: () => void;
}

export function HeroSection({
  content,
  displayProgress,
  isPlaying,
  hasUnlocked,
  onPlayPause,
  onTimeUpdate,
  onScrollToContent,
  onCTAClick,
}: HeroSectionProps) {
  // Get CMS values with fallbacks
  const badge = getCMSValue(content, 'hero_badge', 'Nova Profissão em Alta');
  const titlePrefix = getCMSValue(content, 'hero_title_prefix', 'Descubra a Profissão que Paga de');
  const titleHighlight = getCMSValue(content, 'hero_title_highlight', 'R$10 a R$30 Mil');
  const titleSuffix = getCMSValue(content, 'hero_title_suffix', 'por Mês');
  const titleHighlightColor = getCMSValue(content, 'hero_title_highlight_color', 'gradient');
  const subtitle = getCMSValue(content, 'hero_subtitle', 'Uma carreira em vendas com salário fixo + comissões atrativas. Startups e empresas de todo o Brasil estão contratando.');
  const videoUrl = getCMSValue(content, 'hero_video_url', 'https://formacaocloser.b-cdn.net/copy_64B2EF33-32DD-4816-8FD5-D93AEEABCB23.mp4');
  const posterUrl = getCMSValue(content, 'hero_poster_url', '');
  const ctaButton = getCMSValue(content, 'hero_cta_text', 'Matricule-se Agora');
  const ctaSubtext = getCMSValue(content, 'hero_cta_subtext', 'Acesso imediato • Garantia de 7 dias');

  // Map highlight color to CSS class
  const highlightClass = titleHighlightColor === 'accent' 
    ? 'text-accent' 
    : titleHighlightColor === 'primary'
    ? 'text-primary'
    : 'text-gradient';

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 md:pt-24 pb-6 md:pb-8 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-primary font-medium">{badge}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
          {titlePrefix}{' '}
          <span className={highlightClass}>{titleHighlight}</span>{' '}
          {titleSuffix}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* Video Player */}
        <div className="w-full max-w-3xl mx-auto mt-6 md:mt-8">
          <SmartVideoPlayer
            videoUrl={videoUrl}
            posterUrl={posterUrl || undefined}
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
            {ctaButton}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            {ctaSubtext}
          </p>
        </div>

      </div>
    </section>
  );
}
