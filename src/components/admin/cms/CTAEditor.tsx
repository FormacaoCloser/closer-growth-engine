import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2 } from 'lucide-react';
import { CMSContent, getCMSValue, useBulkSaveCMSContent } from '@/hooks/useCMSContent';

interface CTAEditorProps {
  content: CMSContent[] | undefined;
  isLoading: boolean;
}

export function CTAEditor({ content, isLoading }: CTAEditorProps) {
  const [title, setTitle] = useState('');
  const [feature1, setFeature1] = useState('');
  const [feature2, setFeature2] = useState('');
  const [feature3, setFeature3] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [guaranteeText, setGuaranteeText] = useState('');

  const saveMutation = useBulkSaveCMSContent();

  useEffect(() => {
    if (content) {
      setTitle(getCMSValue(content, 'cta_title', 'Comece sua jornada como Closer'));
      setFeature1(getCMSValue(content, 'cta_feature1', 'Acesso imediato'));
      setFeature2(getCMSValue(content, 'cta_feature2', 'Garantia de 7 dias'));
      setFeature3(getCMSValue(content, 'cta_feature3', 'Suporte exclusivo'));
      setButtonText(getCMSValue(content, 'cta_button_text', 'Matricule-se Agora'));
      setGuaranteeText(getCMSValue(content, 'cta_guarantee_text', ''));
    }
  }, [content]);

  const handleSave = () => {
    saveMutation.mutate({
      pageSlug: 'landing',
      items: [
        { contentKey: 'cta_title', contentValue: title },
        { contentKey: 'cta_feature1', contentValue: feature1 },
        { contentKey: 'cta_feature2', contentValue: feature2 },
        { contentKey: 'cta_feature3', contentValue: feature3 },
        { contentKey: 'cta_button_text', contentValue: buttonText },
        { contentKey: 'cta_guarantee_text', contentValue: guaranteeText },
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
          <CardTitle>Seção de Chamada para Ação (CTA)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Comece sua jornada como Closer"
            />
            <p className="text-xs text-muted-foreground">
              A palavra "Closer" será destacada automaticamente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonText">Texto do Botão</Label>
            <Input
              id="buttonText"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Matricule-se Agora"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recursos/Destaques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Estes são os ícones com texto que aparecem acima do botão CTA
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feature1">Recurso 1 (⚡)</Label>
              <Input
                id="feature1"
                value={feature1}
                onChange={(e) => setFeature1(e.target.value)}
                placeholder="Acesso imediato"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feature2">Recurso 2 (🛡️)</Label>
              <Input
                id="feature2"
                value={feature2}
                onChange={(e) => setFeature2(e.target.value)}
                placeholder="Garantia de 7 dias"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feature3">Recurso 3 (👥)</Label>
              <Input
                id="feature3"
                value={feature3}
                onChange={(e) => setFeature3(e.target.value)}
                placeholder="Suporte exclusivo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Garantia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="guaranteeText">Texto da Garantia</Label>
            <Textarea
              id="guaranteeText"
              value={guaranteeText}
              onChange={(e) => setGuaranteeText(e.target.value)}
              placeholder="Se você não gostar por qualquer motivo, devolvemos 100% do seu dinheiro em até 7 dias."
              rows={3}
            />
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
