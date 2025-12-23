-- Insert new CMS fields for the title structure
INSERT INTO public.cms_content (page_slug, content_key, content_type, content_value)
VALUES 
  ('landing', 'hero_title_prefix', 'text', 'Descubra a Profissão que Paga de'),
  ('landing', 'hero_title_highlight', 'text', 'R$10 a R$30 Mil'),
  ('landing', 'hero_title_suffix', 'text', 'por Mês'),
  ('landing', 'hero_title_highlight_color', 'text', 'gradient')
ON CONFLICT (page_slug, content_key) DO NOTHING;