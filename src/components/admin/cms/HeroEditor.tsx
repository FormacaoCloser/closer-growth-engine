import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2 } from 'lucide-react';
import { CMSContent, getCMSValue, useBulkSaveCMSContent } from '@/hooks/useCMSContent';

interface HeroEditorProps {
  content: CMSContent[] | undefined;
  isLoading: boolean;
}

export function HeroEditor({ content, isLoading }: HeroEditorProps) {
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaSubtext, setCtaSubtext] = useState('');

  const saveMutation = useBulkSaveCMSContent();

  useEffect(() => {
    if (content) {
      setBadge(getCMSValue(content, 'hero_badge', 'Nova Profissão em Alta'));
      setTitle(getCMSValue(content, 'hero_title', 'Descubra a Profissão que Paga de R$10 a R$30 Mil por Mês'));
      setSubtitle(getCMSValue(content, 'hero_subtitle', ''));
      setVideoUrl(getCMSValue(content, 'hero_video_url', ''));
      setCtaText(getCMSValue(content, 'hero_cta_text', 'Matricule-se Agora'));
      setCtaSubtext(getCMSValue(content, 'hero_cta_subtext', 'Acesso imediato • Garantia de 7 dias'));
    }
  }, [content]);

  const handleSave = () => {
    saveMutation.mutate({
      pageSlug: 'landing',
      items: [
        { contentKey: 'hero_badge', contentValue: badge },
        { contentKey: 'hero_title', contentValue: title },
        { contentKey: 'hero_subtitle', contentValue: subtitle },
        { contentKey: 'hero_video_url', contentValue: videoUrl, contentType: 'video' },
        { contentKey: 'hero_cta_text', contentValue: ctaText },
        { contentKey: 'hero_cta_subtext', contentValue: ctaSubtext },
      ],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seção Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="badge">Badge (texto pequeno acima do título)</Label>
            <Input
              id="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Ex: Nova Profissão em Alta"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título Principal</Label>
            <Textarea
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título principal da página"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Dica: Use R$10 a R$30 Mil para destacar os valores
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Textarea
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Texto de apoio abaixo do título"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL do Vídeo (VSL)</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Texto do Botão CTA</Label>
              <Input
                id="ctaText"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Matricule-se Agora"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaSubtext">Texto abaixo do botão</Label>
              <Input
                id="ctaSubtext"
                value={ctaSubtext}
                onChange={(e) => setCtaSubtext(e.target.value)}
                placeholder="Acesso imediato • Garantia de 7 dias"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
