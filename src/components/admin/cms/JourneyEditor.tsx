import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { CMSContent, getCMSValue, getCMSJson, useBulkSaveCMSContent } from '@/hooks/useCMSContent';

const AVAILABLE_ICONS = [
  'Sprout', 'BookOpen', 'Target', 'Theater', 'Briefcase', 'Rocket',
  'Award', 'Star', 'Zap', 'TrendingUp', 'GraduationCap'
];

interface JourneyStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  isStart?: boolean;
  isEnd?: boolean;
}

interface JourneyEditorProps {
  content: CMSContent[] | undefined;
  isLoading: boolean;
}

export function JourneyEditor({ content, isLoading }: JourneyEditorProps) {
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [steps, setSteps] = useState<JourneyStep[]>([]);

  const saveMutation = useBulkSaveCMSContent();

  useEffect(() => {
    if (content) {
      setBadge(getCMSValue(content, 'journey_badge', 'Sua Jornada'));
      setTitle(getCMSValue(content, 'journey_title', 'O que você vai aprender'));
      setSubtitle(getCMSValue(content, 'journey_subtitle', ''));
      setBottomText(getCMSValue(content, 'journey_bottom_text', ''));
      setSteps(getCMSJson<JourneyStep[]>(content, 'journey_steps', []));
    }
  }, [content]);

  const handleSave = () => {
    // Renumber steps
    const numberedSteps = steps.map((step, index) => ({
      ...step,
      step: index + 1,
    }));

    saveMutation.mutate({
      pageSlug: 'landing',
      items: [
        { contentKey: 'journey_badge', contentValue: badge },
        { contentKey: 'journey_title', contentValue: title },
        { contentKey: 'journey_subtitle', contentValue: subtitle },
        { contentKey: 'journey_bottom_text', contentValue: bottomText },
        { contentKey: 'journey_steps', contentValue: JSON.stringify(numberedSteps), contentType: 'json' },
      ],
    });
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        step: steps.length + 1,
        title: '',
        subtitle: '',
        description: '',
        icon: 'Star',
      },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof JourneyStep, value: string | boolean) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
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
            <Label htmlFor="badge">Badge</Label>
            <Input
              id="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Sua Jornada"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que você vai aprender"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Do zero absoluto ao closer contratado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bottomText">Texto Final</Label>
            <Input
              id="bottomText"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="Cada módulo foi desenhado..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Passos da Jornada ({steps.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Passo {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Select
                    value={step.icon}
                    onValueChange={(value) => updateStep(index, 'icon', value)}
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
                  <Label>Título</Label>
                  <Input
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    placeholder="Zero"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={step.subtitle}
                    onChange={(e) => updateStep(index, 'subtitle', e.target.value)}
                    placeholder="Ponto de partida"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={step.description}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                  placeholder="Descrição do passo"
                  rows={2}
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`isStart-${index}`}
                    checked={step.isStart || false}
                    onCheckedChange={(checked) => updateStep(index, 'isStart', !!checked)}
                  />
                  <Label htmlFor={`isStart-${index}`} className="text-sm">
                    Ponto de partida ("Você está aqui")
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`isEnd-${index}`}
                    checked={step.isEnd || false}
                    onCheckedChange={(checked) => updateStep(index, 'isEnd', !!checked)}
                  />
                  <Label htmlFor={`isEnd-${index}`} className="text-sm">
                    Meta final ("🎯 Meta")
                  </Label>
                </div>
              </div>
            </div>
          ))}

          {steps.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum passo cadastrado. Clique em "Adicionar" para começar.
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
