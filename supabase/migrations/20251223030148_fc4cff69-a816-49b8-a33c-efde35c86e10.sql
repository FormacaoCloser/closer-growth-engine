-- Create system_settings table for storing application configuration
CREATE TABLE public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT NOT NULL DEFAULT 'text', -- text, boolean, number, json
  category TEXT NOT NULL DEFAULT 'general', -- general, payment, email, affiliate, security
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- All admins can view settings
CREATE POLICY "Admins can view settings"
ON public.system_settings
FOR SELECT
USING (is_admin(auth.uid()));

-- Only owners can manage settings
CREATE POLICY "Owners can manage settings"
ON public.system_settings
FOR ALL
USING (has_role(auth.uid(), 'owner'))
WITH CHECK (has_role(auth.uid(), 'owner'));

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, category, description) VALUES
-- General
('platform_name', 'Formação Closer', 'text', 'general', 'Nome da plataforma'),
('platform_logo_url', '', 'text', 'general', 'URL do logo da plataforma'),
('support_email', '', 'text', 'general', 'Email de suporte'),
('platform_description', '', 'text', 'general', 'Descrição/tagline da plataforma'),

-- Payment
('stripe_enabled', 'false', 'boolean', 'payment', 'Integração Stripe ativa'),
('default_currency', 'BRL', 'text', 'payment', 'Moeda padrão'),

-- Email
('email_from_name', 'Formação Closer', 'text', 'email', 'Nome do remetente de emails'),
('email_from_address', '', 'text', 'email', 'Email do remetente'),

-- Affiliate
('affiliate_program_enabled', 'true', 'boolean', 'affiliate', 'Programa de afiliados ativo'),
('default_affiliate_commission', '10', 'number', 'affiliate', 'Comissão padrão de afiliado (%)'),
('affiliate_cookie_days', '30', 'number', 'affiliate', 'Dias de validade do cookie de afiliado'),
('affiliate_terms_url', '', 'text', 'affiliate', 'URL dos termos de afiliado'),

-- Security
('session_duration_hours', '24', 'number', 'security', 'Duração da sessão em horas'),
('require_2fa_admins', 'false', 'boolean', 'security', 'Exigir 2FA para admins');