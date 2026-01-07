import { Play } from 'lucide-react';
import { useState } from 'react';
import { CMSContent, getCMSValue, getCMSJson } from '@/hooks/useCMSContent';
import { getIcon } from '@/lib/iconMap';
import { SmartVideoPlayer } from './SmartVideoPlayer';

interface StatItem {
  icon: string;
  value: string;
  label: string;
}

const defaultStats: StatItem[] = [
  { icon: 'Award', value: '7+ anos', label: 'de experiência' },
  { icon: 'Users', value: '2.000+', label: 'alunos formados' },
  { icon: 'Target', value: 'R$50M+', label: 'em vendas fechadas' },
];

interface InstructorSectionProps {
  content?: CMSContent[];
}

export function InstructorSection({ content }: InstructorSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get CMS values with fallbacks
  const title = getCMSValue(content, 'instructor_title', 'Quem é <span class="text-gradient">Alexandre Closer</span>?');
  const subtitle = getCMSValue(content, 'instructor_subtitle', 'Conheça quem vai te guiar nessa jornada de transformação profissional.');
  const bioTitle = getCMSValue(content, 'instructor_bio_title', 'De vendedor comum a referência no mercado');
  const bio1 = getCMSValue(content, 'instructor_bio_text1', 'Alexandre começou sua jornada em vendas há mais de 7 anos, quando o termo "closer" ainda nem existia no Brasil. Depois de fechar milhões em vendas para grandes empresas do digital, decidiu compartilhar seu método com quem quer transformar sua vida através das vendas.');
  const bio2 = getCMSValue(content, 'instructor_bio_text2', 'Sua metodologia é prática, direta e focada em resultados. Nada de teoria acadêmica que não funciona no mundo real. Apenas o que realmente faz você fechar vendas e colocar dinheiro no bolso.');
  const videoUrl = getCMSValue(content, 'instructor_video_url', '');
  const posterUrl = getCMSValue(content, 'instructor_video_poster', '');
  const stats = getCMSJson<StatItem[]>(content, 'instructor_stats', defaultStats);

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    if (duration > 0) {
      setProgress(currentTime / duration);
    }
  };

  return (
    <section className="py-20 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 
            className="text-3xl md:text-4xl font-display font-bold text-foreground"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Video Container */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-background border border-border/50">
            {videoUrl ? (
              <SmartVideoPlayer
                videoUrl={videoUrl}
                posterUrl={posterUrl}
                displayProgress={progress}
                isPlaying={isPlaying}
                onPlayPause={setIsPlaying}
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              // Placeholder when no video
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <Play className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm">Vídeo do instrutor</p>
                <p className="text-xs opacity-50 mt-1">Em breve</p>
              </div>
            )}
          </div>

          {/* Bio Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-display font-bold text-foreground">
                {bioTitle}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {bio1}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {bio2}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {stats.map((stat, index) => {
                const Icon = getIcon(stat.icon);
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
