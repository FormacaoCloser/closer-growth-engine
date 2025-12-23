import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CMSContent {
  id: string;
  page_slug: string;
  content_key: string;
  content_type: string;
  content_value: string;
  updated_at: string;
  updated_by: string | null;
}

// Fetch all CMS content for a page
export function useCMSContent(pageSlug: string = 'landing') {
  return useQuery({
    queryKey: ['cms-content', pageSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('page_slug', pageSlug);

      if (error) throw error;
      return data as CMSContent[];
    },
  });
}

// Get a specific content value with fallback
export function getCMSValue(
  content: CMSContent[] | undefined,
  key: string,
  fallback: string = ''
): string {
  if (!content) return fallback;
  const item = content.find((c) => c.content_key === key);
  return item?.content_value ?? fallback;
}

// Get a JSON content value with fallback
export function getCMSJson<T>(
  content: CMSContent[] | undefined,
  key: string,
  fallback: T
): T {
  if (!content) return fallback;
  const item = content.find((c) => c.content_key === key);
  if (!item?.content_value) return fallback;
  try {
    return JSON.parse(item.content_value) as T;
  } catch {
    return fallback;
  }
}

// Save CMS content
export function useSaveCMSContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pageSlug,
      contentKey,
      contentValue,
      contentType = 'text',
    }: {
      pageSlug: string;
      contentKey: string;
      contentValue: string;
      contentType?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('cms_content')
        .upsert(
          {
            page_slug: pageSlug,
            content_key: contentKey,
            content_value: contentValue,
            content_type: contentType,
            updated_at: new Date().toISOString(),
            updated_by: user.user?.id || null,
          },
          {
            onConflict: 'page_slug,content_key',
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cms-content', variables.pageSlug] });
      toast.success('Conteúdo salvo com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving CMS content:', error);
      toast.error('Erro ao salvar conteúdo');
    },
  });
}

// Save multiple CMS content items at once
export function useBulkSaveCMSContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pageSlug,
      items,
    }: {
      pageSlug: string;
      items: { contentKey: string; contentValue: string; contentType?: string }[];
    }) => {
      const { data: user } = await supabase.auth.getUser();

      const records = items.map((item) => ({
        page_slug: pageSlug,
        content_key: item.contentKey,
        content_value: item.contentValue,
        content_type: item.contentType || 'text',
        updated_at: new Date().toISOString(),
        updated_by: user.user?.id || null,
      }));

      const { data, error } = await supabase
        .from('cms_content')
        .upsert(records, {
          onConflict: 'page_slug,content_key',
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cms-content', variables.pageSlug] });
      toast.success('Conteúdo salvo com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving CMS content:', error);
      toast.error('Erro ao salvar conteúdo');
    },
  });
}
