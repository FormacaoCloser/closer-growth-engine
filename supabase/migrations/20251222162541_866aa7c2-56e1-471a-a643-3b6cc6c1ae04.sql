-- ===========================================
-- FASE 1: SCHEMA COMPLETO - FORMAÇÃO CLOSER
-- ===========================================

-- 1. ENUM PARA ROLES DO SISTEMA
CREATE TYPE public.app_role AS ENUM ('owner', 'support', 'commercial', 'editor', 'financial', 'affiliate', 'student');

-- 2. TABELA DE ROLES DE USUÁRIO
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. FUNÇÃO PARA VERIFICAR ROLE (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar qualquer role administrativa
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('owner', 'support', 'commercial', 'editor', 'financial')
  )
$$;

-- 4. TABELA DE PERFIS
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. TABELA DE CURSOS
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0,
    installment_price_cents INTEGER,
    max_installments INTEGER DEFAULT 12,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 6. TABELA DE MÓDULOS
CREATE TABLE public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    drip_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- 7. TABELA DE AULAS
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    video_duration_seconds INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_free BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 8. TABELA DE MATERIAIS COMPLEMENTARES
CREATE TABLE public.lesson_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

-- 9. TABELA DE MATRÍCULAS (ENROLLMENTS)
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'refunded', 'pending')),
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 10. TABELA DE PROGRESSO
CREATE TABLE public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- 11. TABELA CMS - CONTEÚDO EDITÁVEL
CREATE TABLE public.cms_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL,
    content_key TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'image', 'video', 'json')),
    content_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE (page_slug, content_key)
);

ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- 12. TABELA DE AFILIADOS
CREATE TABLE public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    affiliate_code TEXT UNIQUE NOT NULL,
    commission_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    total_sales INTEGER NOT NULL DEFAULT 0,
    total_earnings_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- 13. TABELA DE VENDAS/ORDENS
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    amount_cents INTEGER NOT NULL,
    affiliate_commission_cents INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed', 'abandoned')),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    paid_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 14. TABELA DE LEADS
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    source TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    converted_at TIMESTAMP WITH TIME ZONE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 15. TABELA DE CARRINHOS ABANDONADOS
CREATE TABLE public.abandoned_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    checkout_step TEXT,
    recovery_email_sent BOOLEAN NOT NULL DEFAULT false,
    recovery_email_sent_at TIMESTAMP WITH TIME ZONE,
    recovered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- USER_ROLES POLICIES
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'owner'))
    WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Support can view student profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'support'));

-- COURSES POLICIES
CREATE POLICY "Anyone can view active courses"
    ON public.courses FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage courses"
    ON public.courses FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- MODULES POLICIES
CREATE POLICY "Anyone can view active modules"
    ON public.modules FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage modules"
    ON public.modules FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- LESSONS POLICIES
CREATE POLICY "Anyone can view active lessons"
    ON public.lessons FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage lessons"
    ON public.lessons FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- LESSON_MATERIALS POLICIES
CREATE POLICY "Enrolled users can view materials"
    ON public.lesson_materials FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.lessons l
            JOIN public.modules m ON l.module_id = m.id
            JOIN public.enrollments e ON e.course_id = m.course_id
            WHERE l.id = lesson_materials.lesson_id
            AND e.user_id = auth.uid()
            AND e.status = 'active'
        )
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "Admins can manage materials"
    ON public.lesson_materials FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ENROLLMENTS POLICIES
CREATE POLICY "Users can view their own enrollments"
    ON public.enrollments FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
    ON public.enrollments FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage enrollments"
    ON public.enrollments FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- LESSON_PROGRESS POLICIES
CREATE POLICY "Users can manage their own progress"
    ON public.lesson_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
    ON public.lesson_progress FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()));

-- CMS_CONTENT POLICIES
CREATE POLICY "Anyone can read CMS content"
    ON public.cms_content FOR SELECT
    USING (true);

CREATE POLICY "Editors can manage CMS"
    ON public.cms_content FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'owner'))
    WITH CHECK (public.has_role(auth.uid(), 'editor') OR public.has_role(auth.uid(), 'owner'));

-- AFFILIATES POLICIES
CREATE POLICY "Users can view their own affiliate data"
    ON public.affiliates FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Commercial and Financial can view affiliates"
    ON public.affiliates FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'commercial') 
        OR public.has_role(auth.uid(), 'financial')
        OR public.has_role(auth.uid(), 'owner')
    );

CREATE POLICY "Commercial can manage affiliates"
    ON public.affiliates FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'commercial') OR public.has_role(auth.uid(), 'owner'))
    WITH CHECK (public.has_role(auth.uid(), 'commercial') OR public.has_role(auth.uid(), 'owner'));

-- ORDERS POLICIES
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Financial can view all orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'financial') 
        OR public.has_role(auth.uid(), 'commercial')
        OR public.has_role(auth.uid(), 'owner')
    );

CREATE POLICY "System can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Financial can update orders"
    ON public.orders FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'financial') OR public.has_role(auth.uid(), 'owner'));

-- LEADS POLICIES
CREATE POLICY "Anyone can create leads"
    ON public.leads FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Commercial can view and manage leads"
    ON public.leads FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'commercial') OR public.has_role(auth.uid(), 'owner'))
    WITH CHECK (public.has_role(auth.uid(), 'commercial') OR public.has_role(auth.uid(), 'owner'));

-- ABANDONED_CARTS POLICIES
CREATE POLICY "Anyone can create abandoned carts"
    ON public.abandoned_carts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Commercial can manage abandoned carts"
    ON public.abandoned_carts FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'commercial') OR public.has_role(auth.uid(), 'owner'))
    WITH CHECK (public.has_role(auth.uid(), 'commercial') OR public.has_role(auth.uid(), 'owner'));

-- ===========================================
-- FUNÇÕES AUXILIARES
-- ===========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON public.modules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_content_updated_at
    BEFORE UPDATE ON public.cms_content
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
    BEFORE UPDATE ON public.lesson_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar código de afiliado
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;