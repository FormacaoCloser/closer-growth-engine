import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { CMSContent, getCMSValue, useBulkSaveCMSContent } from '@/hooks/useCMSContent';

interface MiniCTAEditorProps {
  content?: CMSContent[];
  isLoading: boolean;
}

export function MiniCTAEditor({ content, isLoading }: MiniCTAEditorProps) {
  const [buttonText, setButtonText] = useState('');
  const [subtext, setSubtext] = useState('');
  
  const saveMutation = useBulkSaveCMSContent();

  useEffect(() => {
    if (content) {
      setButtonText(getCMSValue(content, 'mini_cta_button', 'Quero Começar Agora'));
      setSubtext(getCMSValue(content, 'mini_cta_subtext', 'Acesso imediato • Garantia de 7 dias'));
    }
  }, [content]);

  const handleSave = () => {
    saveMutation.mutate({
      pageSlug: 'landing',
      items: [
        { contentKey: 'mini_cta_button', contentValue: buttonText },
        { contentKey: 'mini_cta_subtext', contentValue: subtext },
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
          <CardTitle>Mini CTA</CardTitle>
          <CardDescription>
            Configure o botão CTA intermediário que aparece entre as seções
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buttonText">Texto do Botão</Label>
            <Input
              id="buttonText"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Quero Começar Agora"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subtext">Texto Abaixo do Botão</Label>
            <Input
              id="subtext"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder="Acesso imediato • Garantia de 7 dias"
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        disabled={saveMutation.isPending}
        className="w-full"
      >
        {saveMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Salvar Alterações
      </Button>
    </div>
  );
}
