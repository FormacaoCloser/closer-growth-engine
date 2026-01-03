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
  const [titlePrefix, setTitlePrefix] = useState('');
  const [titleHighlight, setTitleHighlight] = useState('');
  const [titleSuffix, setTitleSuffix] = useState('');
  const [titleHighlightColor, setTitleHighlightColor] = useState('gradient');
  const [subtitle, setSubtitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaSubtext, setCtaSubtext] = useState('');

  const saveMutation = useBulkSaveCMSContent();

  useEffect(() => {
    if (content) {
      setBadge(getCMSValue(content, 'hero_badge', 'Nova Profissão em Alta'));
      setTitlePrefix(getCMSValue(content, 'hero_title_prefix', 'Descubra a Profissão que Paga de'));
      setTitleHighlight(getCMSValue(content, 'hero_title_highlight', 'R$10 a R$30 Mil'));
      setTitleSuffix(getCMSValue(content, 'hero_title_suffix', 'por Mês'));
      setTitleHighlightColor(getCMSValue(content, 'hero_title_highlight_color', 'gradient'));
      setSubtitle(getCMSValue(content, 'hero_subtitle', ''));
      setVideoUrl(getCMSValue(content, 'hero_video_url', ''));
      setPosterUrl(getCMSValue(content, 'hero_poster_url', ''));
      setCtaText(getCMSValue(content, 'hero_cta_text', 'Matricule-se Agora'));
      setCtaSubtext(getCMSValue(content, 'hero_cta_subtext', 'Acesso imediato • Garantia de 7 dias'));
    }
  }, [content]);

  const handleSave = () => {
    saveMutation.mutate({
      pageSlug: 'landing',
      items: [
        { contentKey: 'hero_badge', contentValue: badge },
        { contentKey: 'hero_title_prefix', contentValue: titlePrefix },
        { contentKey: 'hero_title_highlight', contentValue: titleHighlight },
        { contentKey: 'hero_title_suffix', contentValue: titleSuffix },
        { contentKey: 'hero_title_highlight_color', contentValue: titleHighlightColor },
        { contentKey: 'hero_subtitle', contentValue: subtitle },
        { contentKey: 'hero_video_url', contentValue: videoUrl, contentType: 'video' },
        { contentKey: 'hero_poster_url', contentValue: posterUrl, contentType: 'image' },
        { contentKey: 'hero_cta_text', contentValue: ctaText },
        { contentKey: 'hero_cta_subtext', contentValue: ctaSubtext },
      ],
    });
  };

  // Get highlight class for preview
  const getHighlightClass = () => {
    switch (titleHighlightColor) {
      case 'accent': return 'text-amber-500';
      case 'primary': return 'text-primary';
      default: return 'bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent';
    }
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

          <div className="space-y-4">
            <Label>Título Principal (3 partes)</Label>
            
            <div className="space-y-2">
              <Label htmlFor="titlePrefix" className="text-sm font-normal text-muted-foreground">Texto antes do destaque</Label>
              <Input
                id="titlePrefix"
                value={titlePrefix}
                onChange={(e) => setTitlePrefix(e.target.value)}
                placeholder="Descubra a Profissão que Paga de"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titleHighlight" className="text-sm font-normal text-muted-foreground">Texto em destaque (colorido)</Label>
              <Input
                id="titleHighlight"
                value={titleHighlight}
                onChange={(e) => setTitleHighlight(e.target.value)}
                placeholder="R$10 a R$30 Mil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titleSuffix" className="text-sm font-normal text-muted-foreground">Texto depois do destaque</Label>
              <Input
                id="titleSuffix"
                value={titleSuffix}
                onChange={(e) => setTitleSuffix(e.target.value)}
                placeholder="por Mês"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-normal text-muted-foreground">Cor do destaque</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="highlightColor"
                    value="gradient"
                    checked={titleHighlightColor === 'gradient'}
                    onChange={() => setTitleHighlightColor('gradient')}
                    className="accent-primary"
                  />
                  <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent font-semibold">Verde (Gradiente)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="highlightColor"
                    value="accent"
                    checked={titleHighlightColor === 'accent'}
                    onChange={() => setTitleHighlightColor('accent')}
                    className="accent-primary"
                  />
                  <span className="text-amber-500 font-semibold">Dourado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="highlightColor"
                    value="primary"
                    checked={titleHighlightColor === 'primary'}
                    onChange={() => setTitleHighlightColor('primary')}
                    className="accent-primary"
                  />
                  <span className="text-primary font-semibold">Primário</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <p className="text-lg font-bold">
                {titlePrefix}{' '}
                <span className={getHighlightClass()}>{titleHighlight}</span>{' '}
                {titleSuffix}
              </p>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="posterUrl">URL do Thumbnail/Poster do Vídeo</Label>
            <Input
              id="posterUrl"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://... (imagem exibida antes do play)"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Imagem que aparece antes do vídeo começar. Importante para dispositivos móveis.
            </p>
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
