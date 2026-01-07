import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { CMSContent, getCMSValue, getCMSJson, useBulkSaveCMSContent } from '@/hooks/useCMSContent';

const AVAILABLE_ICONS = ['Award', 'Users', 'Target', 'Trophy', 'Star', 'Zap', 'TrendingUp'];

interface StatItem {
  icon: string;
  value: string;
  label: string;
}

interface InstructorEditorProps {
  content: CMSContent[] | undefined;
  isLoading: boolean;
}

export function InstructorEditor({ content, isLoading }: InstructorEditorProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [bioTitle, setBioTitle] = useState('');
  const [bioText1, setBioText1] = useState('');
  const [bioText2, setBioText2] = useState('');
  const [stats, setStats] = useState<StatItem[]>([]);

  const saveMutation = useBulkSaveCMSContent();

  useEffect(() => {
    if (content) {
      setTitle(getCMSValue(content, 'instructor_title', 'Quem é Alexandre Closer?'));
      setSubtitle(getCMSValue(content, 'instructor_subtitle', ''));
      setVideoUrl(getCMSValue(content, 'instructor_video_url', ''));
      setPosterUrl(getCMSValue(content, 'instructor_video_poster', ''));
      setBioTitle(getCMSValue(content, 'instructor_bio_title', ''));
      setBioText1(getCMSValue(content, 'instructor_bio_text1', ''));
      setBioText2(getCMSValue(content, 'instructor_bio_text2', ''));
      setStats(getCMSJson<StatItem[]>(content, 'instructor_stats', []));
    }
  }, [content]);

  const handleSave = () => {
    saveMutation.mutate({
      pageSlug: 'landing',
      items: [
        { contentKey: 'instructor_title', contentValue: title },
        { contentKey: 'instructor_subtitle', contentValue: subtitle },
        { contentKey: 'instructor_video_url', contentValue: videoUrl, contentType: 'video' },
        { contentKey: 'instructor_video_poster', contentValue: posterUrl, contentType: 'image' },
        { contentKey: 'instructor_bio_title', contentValue: bioTitle },
        { contentKey: 'instructor_bio_text1', contentValue: bioText1 },
        { contentKey: 'instructor_bio_text2', contentValue: bioText2 },
        { contentKey: 'instructor_stats', contentValue: JSON.stringify(stats), contentType: 'json' },
      ],
    });
  };

  const addStat = () => {
    if (stats.length < 4) {
      setStats([...stats, { icon: 'Star', value: '', label: '' }]);
    }
  };

  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, field: keyof StatItem, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setStats(newStats);
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
          <CardTitle>Cabeçalho da Seção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quem é Alexandre Closer?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Texto de apoio"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vídeo do Instrutor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL do Vídeo</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Deixe vazio para mostrar placeholder "Em breve"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="posterUrl">Thumbnail do Vídeo</Label>
            <Input
              id="posterUrl"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Imagem exibida antes do vídeo começar a tocar
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Biografia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bioTitle">Título da Bio</Label>
            <Input
              id="bioTitle"
              value={bioTitle}
              onChange={(e) => setBioTitle(e.target.value)}
              placeholder="De vendedor comum a referência no mercado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bioText1">Parágrafo 1</Label>
            <Textarea
              id="bioText1"
              value={bioText1}
              onChange={(e) => setBioText1(e.target.value)}
              placeholder="Primeiro parágrafo da biografia"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bioText2">Parágrafo 2</Label>
            <Textarea
              id="bioText2"
              value={bioText2}
              onChange={(e) => setBioText2(e.target.value)}
              placeholder="Segundo parágrafo da biografia"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Estatísticas ({stats.length}/4)</CardTitle>
          <Button variant="outline" size="sm" onClick={addStat} disabled={stats.length >= 4}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Estatística {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStat(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Select
                    value={stat.icon}
                    onValueChange={(value) => updateStat(index, 'icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    value={stat.value}
                    onChange={(e) => updateStat(index, 'value', e.target.value)}
                    placeholder="7+ anos"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rótulo</Label>
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                    placeholder="de experiência"
                  />
                </div>
              </div>
            </div>
          ))}

          {stats.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma estatística cadastrada. Clique em "Adicionar" para começar.
            </p>
          )}
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
