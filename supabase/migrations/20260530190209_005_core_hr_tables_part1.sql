/*
  # Core HR Tables - Part 1: Organizational Structure
  
  ## New Tables:
  - `departments` - Organization departments
  - `positions` - Job positions within departments
  - `employee_categories` - Employee job categories/classifications
  - `grades` - Grade/level system
*/

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE public.departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  name_ar         TEXT,
  code            TEXT,
  description     TEXT,
  parent_id       UUID,
  manager_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, name)
);

-- Add self-reference after table creation
ALTER TABLE public.departments 
  ADD CONSTRAINT fk_departments_parent 
  FOREIGN KEY (parent_id) REFERENCES public.departments(id) ON DELETE SET NULL;

-- ============================================================
-- POSITIONS
-- ============================================================
CREATE TABLE public.positions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id   UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  title_ar        TEXT,
  code            TEXT,
  description     TEXT,
  requirements    TEXT[],
  salary_range_min INTEGER,
  salary_range_max INTEGER,
  employment_type TEXT DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, title)
);

-- ============================================================
-- EMPLOYEE CATEGORIES
-- ============================================================
CREATE TABLE public.employee_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  name_ar         TEXT,
  code            TEXT,
  department      TEXT,
  description     TEXT,
  grade_level     TEXT,
  metadata        JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, name)
);

-- ============================================================
-- GRADES
-- ============================================================
CREATE TABLE public.grades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  name_ar         TEXT,
  code            TEXT NOT NULL,
  level           INTEGER NOT NULL,
  description     TEXT,
  min_salary      INTEGER,
  max_salary      INTEGER,
  metadata        JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, code)
);

-- ============================================================
-- INDEXES FOR PART 1
-- ============================================================
CREATE INDEX idx_departments_org ON public.departments(organization_id);
CREATE INDEX idx_departments_parent ON public.departments(parent_id);
CREATE INDEX idx_departments_manager ON public.departments(manager_id);
CREATE INDEX idx_positions_org ON public.positions(organization_id);
CREATE INDEX idx_positions_dept ON public.positions(department_id);
CREATE INDEX idx_employee_categories_org ON public.employee_categories(organization_id);
CREATE INDEX idx_grades_org ON public.grades(organization_id);
CREATE INDEX idx_grades_level ON public.grades(level);
