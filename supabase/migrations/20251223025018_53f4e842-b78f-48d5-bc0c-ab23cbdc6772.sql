-- Create affiliate_payouts table for tracking payments to affiliates
CREATE TABLE public.affiliate_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Financial and Owner can manage payouts
CREATE POLICY "Financial can manage payouts"
ON public.affiliate_payouts
FOR ALL
USING (has_role(auth.uid(), 'financial'::app_role) OR has_role(auth.uid(), 'owner'::app_role))
WITH CHECK (has_role(auth.uid(), 'financial'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Commercial can view payouts
CREATE POLICY "Commercial can view payouts"
ON public.affiliate_payouts
FOR SELECT
USING (has_role(auth.uid(), 'commercial'::app_role));

-- Affiliates can view their own payouts
CREATE POLICY "Affiliates can view own payouts"
ON public.affiliate_payouts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE affiliates.id = affiliate_payouts.affiliate_id
    AND affiliates.user_id = auth.uid()
  )
);

-- Add constraint for status values
ALTER TABLE public.affiliate_payouts
ADD CONSTRAINT affiliate_payouts_status_check
CHECK (status IN ('pending', 'paid', 'cancelled'));