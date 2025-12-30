-- Tabela para pagamentos Pix manuais
CREATE TABLE public.manual_pix_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  course_id UUID REFERENCES public.courses(id),
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.manual_pix_payments ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public checkout form)
CREATE POLICY "Anyone can insert manual pix payments"
ON public.manual_pix_payments
FOR INSERT
WITH CHECK (true);

-- Admins can manage all
CREATE POLICY "Admins can manage manual pix payments"
ON public.manual_pix_payments
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Commercial can view
CREATE POLICY "Commercial can view manual pix payments"
ON public.manual_pix_payments
FOR SELECT
USING (has_role(auth.uid(), 'commercial') OR has_role(auth.uid(), 'owner'));