/*
  # Core HR Tables - Part 5: Training, Documents, Promotions
  
  ## New Tables:
  - `training_programs` - Training programs
  - `training_enrollments` - Employee enrollments in training
  - `document_templates` - Document templates
  - `documents` - Generated documents
  - `promotion_rules` - Rules for automatic promotions
  - `promotion_records` - Promotion history
*/

-- ============================================================
-- TRAINING PROGRAMS
-- ============================================================
CREATE TABLE public.training_programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  title           TEXT NOT NULL,
  title_ar        TEXT,
  code            TEXT,
  description     TEXT,
  
  category        TEXT,
  instructor      TEXT,
  instructor_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  start_date      DATE,
  end_date        DATE,
  
  location        TEXT,
  is_online       BOOLEAN DEFAULT false,
  meeting_url     TEXT,
  
  capacity        INTEGER DEFAULT 0,
  enrolled_count  INTEGER DEFAULT 0,
  
  status          TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in-progress', 'completed', 'cancelled')),
  
  certificate_template UUID,
  
  cost            INTEGER DEFAULT 0,
  currency        TEXT DEFAULT 'DZD',
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TRAINING ENROLLMENTS
-- ============================================================
CREATE TABLE public.training_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  training_id     UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  enrolled_at     TIMESTAMPTZ DEFAULT now(),
  enrolled_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  status          TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in-progress', 'completed', 'cancelled', 'failed')),
  
  progress        INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  
  score           INTEGER,
  certificate_url TEXT,
  
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  
  UNIQUE(training_id, employee_id)
);

-- ============================================================
-- DOCUMENT TEMPLATES
-- ============================================================
CREATE TABLE public.document_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  name            TEXT NOT NULL,
  name_ar         TEXT,
  code            TEXT,
  description     TEXT,
  
  document_type   TEXT NOT NULL,
  
  content         TEXT NOT NULL,
  fields          TEXT[],
  
  is_active       BOOLEAN DEFAULT true,
  is_system      BOOLEAN DEFAULT false,
  
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, code)
);

-- Add foreign key reference for certificate template
ALTER TABLE public.training_programs 
  ADD CONSTRAINT fk_training_certificate_template 
  FOREIGN KEY (certificate_template) REFERENCES public.document_templates(id) ON DELETE SET NULL;

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE public.documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id     UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  template_id     UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  
  document_type   TEXT NOT NULL,
  name            TEXT NOT NULL,
  
  content         TEXT,
  file_url        TEXT,
  file_size       INTEGER,
  
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'signed', 'rejected', 'archived')),
  
  generated_at    TIMESTAMPTZ,
  generated_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  signed_at       TIMESTAMPTZ,
  signed_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  expires_at      TIMESTAMPTZ,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PROMOTION RULES
-- ============================================================
CREATE TABLE public.promotion_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.employee_categories(id) ON DELETE SET NULL,
  
  from_grade_id   UUID NOT NULL REFERENCES public.grades(id) ON DELETE RESTRICT,
  to_grade_id     UUID NOT NULL REFERENCES public.grades(id) ON DELETE RESTRICT,
  
  required_years  INTEGER DEFAULT 0,
  required_performance_rating DECIMAL(3,2),
  
  salary_increase_percent DECIMAL(5,2) DEFAULT 0,
  
  is_active       BOOLEAN DEFAULT true,
  auto_promote    BOOLEAN DEFAULT false,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PROMOTION RECORDS
-- ============================================================
CREATE TABLE public.promotion_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  rule_id         UUID REFERENCES public.promotion_rules(id) ON DELETE SET NULL,
  
  previous_position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  new_position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  
  previous_grade_id UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  new_grade_id    UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  
  previous_salary INTEGER,
  new_salary      INTEGER,
  
  promotion_type  TEXT DEFAULT 'manual' CHECK (promotion_type IN ('automatic', 'manual')),
  effective_date  DATE NOT NULL,
  
  reason          TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'effective', 'cancelled')),
  
  approved_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at    TIMESTAMPTZ,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PART 5
-- ============================================================
CREATE INDEX idx_training_programs_org ON public.training_programs(organization_id);
CREATE INDEX idx_training_programs_status ON public.training_programs(status);
CREATE INDEX idx_training_programs_dates ON public.training_programs(start_date, end_date);

CREATE INDEX idx_training_enrollments_org ON public.training_enrollments(organization_id);
CREATE INDEX idx_training_enrollments_training ON public.training_enrollments(training_id);
CREATE INDEX idx_training_enrollments_employee ON public.training_enrollments(employee_id);
CREATE INDEX idx_training_enrollments_status ON public.training_enrollments(status);

CREATE INDEX idx_document_templates_org ON public.document_templates(organization_id);
CREATE INDEX idx_document_templates_type ON public.document_templates(document_type);
CREATE INDEX idx_document_templates_active ON public.document_templates(is_active);

CREATE INDEX idx_documents_org ON public.documents(organization_id);
CREATE INDEX idx_documents_employee ON public.documents(employee_id);
CREATE INDEX idx_documents_template ON public.documents(template_id);
CREATE INDEX idx_documents_status ON public.documents(status);

CREATE INDEX idx_promotion_rules_org ON public.promotion_rules(organization_id);
CREATE INDEX idx_promotion_rules_category ON public.promotion_rules(category_id);
CREATE INDEX idx_promotion_rules_grades ON public.promotion_rules(from_grade_id, to_grade_id);

CREATE INDEX idx_promotion_records_org ON public.promotion_records(organization_id);
CREATE INDEX idx_promotion_records_employee ON public.promotion_records(employee_id);
CREATE INDEX idx_promotion_records_status ON public.promotion_records(status);
CREATE INDEX idx_promotion_records_effective ON public.promotion_records(effective_date);
