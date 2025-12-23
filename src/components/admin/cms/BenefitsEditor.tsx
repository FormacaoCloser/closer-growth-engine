import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { CMSContent, getCMSValue, getCMSJson, useBulkSaveCMSContent } from '@/hooks/useCMSContent';

const AVAILABLE_ICONS = [
  'Home', 'Clock', 'DollarSign', 'TrendingUp', 'GraduationCap', 'Rocket',
  'Target', 'Users', 'Award', 'Shield', 'Zap', 'Star'
];

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

interface BenefitsEditorProps {
  content: CMSContent[] | undefined;
  isLoading: boolean;
}

export function BenefitsEditor({ content, isLoading }: BenefitsEditorProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [items, setItems] = useState<BenefitItem[]>([]);

  const saveMutation = useBulkSaveCMSContent();

  useEffect(() => {
    if (content) {
      setTitle(getCMSValue(content, 'benefits_title', 'Por que virar um Closer?'));
      setSubtitle(getCMSValue(content, 'benefits_subtitle', ''));
      setItems(getCMSJson<BenefitItem[]>(content, 'benefits_items', []));
    }
  }, [content]);

  const handleSave = () => {
    saveMutation.mutate({
      pageSlug: 'landing',
      items: [
        { contentKey: 'benefits_title', contentValue: title },
        { contentKey: 'benefits_subtitle', contentValue: subtitle },
        { contentKey: 'benefits_items', contentValue: JSON.stringify(items), contentType: 'json' },
      ],
    });
  };

  const addItem = () => {
    setItems([...items, { icon: 'Star', title: '', description: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BenefitItem, value: string) => {
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
          <CardTitle>Cabeçalho da Seção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Por que virar um Closer?"
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Benefícios ({items.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Benefício {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                <div className="space-y-2 md:col-span-2">
                  <Label>Título</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    placeholder="Título do benefício"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Descrição do benefício"
                  rows={2}
                />
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum benefício cadastrado. Clique em "Adicionar" para começar.
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
