import { Play, Award, Users, Target } from 'lucide-react';
import { useRef, useState } from 'react';

const stats = [
  { icon: Award, value: '7+ anos', label: 'de experiência' },
  { icon: Users, value: '2.000+', label: 'alunos formados' },
  { icon: Target, value: 'R$50M+', label: 'em vendas fechadas' },
];

interface InstructorSectionProps {
  videoUrl?: string;
}

export function InstructorSection({ 
  videoUrl = '' // Deixar vazio para o usuário definir depois
}: InstructorSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="py-20 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Quem é <span className="text-gradient">Alexandre Closer</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conheça quem vai te guiar nessa jornada de transformação profissional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Video Container */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-background border border-border/50 group">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
                {/* Play/Pause Overlay */}
                <button
                  onClick={handlePlayPause}
                  className={`absolute inset-0 flex items-center justify-center bg-background/30 transition-opacity ${
                    isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
                  }`}
                >
                  <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </button>
              </>
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
                De vendedor comum a referência no mercado
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Alexandre começou sua jornada em vendas há mais de 7 anos, quando o termo "closer" 
                ainda nem existia no Brasil. Depois de fechar milhões em vendas para grandes 
                empresas do digital, decidiu compartilhar seu método com quem quer transformar 
                sua vida através das vendas.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Sua metodologia é prática, direta e focada em resultados. Nada de teoria 
                acadêmica que não funciona no mundo real. Apenas o que realmente faz você 
                fechar vendas e colocar dinheiro no bolso.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
