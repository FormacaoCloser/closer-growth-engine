import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { CMSContent, getCMSValue, getCMSJson, useBulkSaveCMSContent } from '@/hooks/useCMSContent';

const AVAILABLE_ICONS = [
  'Target', 'User', 'Phone', 'Users', 'Wallet', 'Clock', 'Mic', 'RefreshCw',
  'Globe', 'Shield', 'FileText', 'Calendar', 'TrendingUp', 'Video', 'MessageCircle'
];

interface FAQItem {
  icon: string;
  question: string;
  answer: string;
  highlight: string;
}

interface FAQEditorProps {
  content: CMSContent[] | undefined;
  isLoading: boolean;
}

export function FAQEditor({ content, isLoading }: FAQEditorProps) {
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [items, setItems] = useState<FAQItem[]>([]);

  const saveMutation = useBulkSaveCMSContent();

  useEffect(() => {
    if (content) {
      setBadge(getCMSValue(content, 'faq_badge', 'Dúvidas Comuns'));
      setTitle(getCMSValue(content, 'faq_title', 'Será que eu consigo?'));
      setSubtitle(getCMSValue(content, 'faq_subtitle', ''));
      setItems(getCMSJson<FAQItem[]>(content, 'faq_items', []));
    }
  }, [content]);

  const handleSave = () => {
    saveMutation.mutate({
      pageSlug: 'landing',
      items: [
        { contentKey: 'faq_badge', contentValue: badge },
        { contentKey: 'faq_title', contentValue: title },
        { contentKey: 'faq_subtitle', contentValue: subtitle },
        { contentKey: 'faq_items', contentValue: JSON.stringify(items), contentType: 'json' },
      ],
    });
  };

  const addItem = () => {
    setItems([...items, { icon: 'MessageCircle', question: '', answer: '', highlight: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof FAQItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
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
          <CardTitle>Cabeçalho da Seção FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="badge">Badge</Label>
            <Input
              id="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Dúvidas Comuns"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Será que eu consigo?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Clique nas perguntas abaixo para ver as respostas"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Perguntas ({items.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {items.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-xs bg-muted px-2 py-1 rounded">#{index + 1}</span>
                    <span className="text-sm font-medium truncate max-w-[300px]">
                      {item.question || 'Nova pergunta'}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label>Ícone</Label>
                      <Select
                        value={item.icon}
                        onValueChange={(value) => updateItem(index, 'icon', value)}
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

                    <div className="space-y-2 md:col-span-3">
                      <Label>Pergunta</Label>
                      <Input
                        value={item.question}
                        onChange={(e) => updateItem(index, 'question', e.target.value)}
                        placeholder="A pergunta do usuário"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Resposta</Label>
                    <Textarea
                      value={item.answer}
                      onChange={(e) => updateItem(index, 'answer', e.target.value)}
                      placeholder="A resposta detalhada"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Palavra em Destaque</Label>
                    <Input
                      value={item.highlight}
                      onChange={(e) => updateItem(index, 'highlight', e.target.value)}
                      placeholder="Palavra que será destacada na resposta"
                    />
                    <p className="text-xs text-muted-foreground">
                      Esta palavra aparecerá em destaque (cor primária) na resposta
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {items.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma pergunta cadastrada. Clique em "Adicionar" para começar.
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
