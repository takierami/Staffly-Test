/*
  # Core HR Tables - Part 2: Employee & Leave Management
  
  ## New Tables:
  - `leave_types` - Types of leave
  - `employees` - Core employee records
  - `leave_balances` - Employee leave balances per year
  - `leave_requests` - Employee leave requests
  - `leave_adjustment_proposals` - Proposed adjustments to leave dates
*/

-- ============================================================
-- LEAVE TYPES
-- ============================================================
CREATE TABLE public.leave_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  name_ar         TEXT,
  code            TEXT,
  description     TEXT,
  default_days    INTEGER DEFAULT 0,
  is_paid         BOOLEAN DEFAULT true,
  carry_over_max  INTEGER DEFAULT 0,
  color           TEXT,
  icon            TEXT,
  metadata        JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, code)
);

-- ============================================================
-- EMPLOYEES (Core Table)
-- ============================================================
CREATE TABLE public.employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Personal Information
  employee_code   TEXT NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  first_name_ar   TEXT,
  last_name_ar    TEXT,
  email           TEXT NOT NULL,
  phone           TEXT,
  personal_email  TEXT,
  date_of_birth   DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other')),
  national_id     TEXT,
  marital_status  TEXT,
  nationality     TEXT,
  
  -- Address
  address         TEXT,
  city            TEXT,
  state           TEXT,
  country         TEXT,
  postal_code     TEXT,
  
  -- Employment Details
  department_id   UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  position_id     UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  category_id     UUID REFERENCES public.employee_categories(id) ON DELETE SET NULL,
  grade_id        UUID REFERENCES public.grades(id) ON DELETE SET NULL,
  
  employment_type TEXT DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern')),
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'on-leave', 'probation', 'terminated', 'suspended')),
  
  hire_date       DATE NOT NULL,
  termination_date DATE,
  probation_end_date DATE,
  
  reports_to      UUID,
  
  -- Compensation
  basic_salary    INTEGER DEFAULT 0,
  currency        TEXT DEFAULT 'DZD',
  salary_type     TEXT DEFAULT 'monthly' CHECK (salary_type IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
  bank_name       TEXT,
  bank_account    TEXT,
  bank_rib        TEXT,
  
  -- Skills & Qualifications
  skills          TEXT[],
  education       JSONB DEFAULT '[]',
  certifications  JSONB DEFAULT '[]',
  
  -- Profile
  avatar_url      TEXT,
  
  -- Additional
  metadata        JSONB DEFAULT '{}',
  
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  UNIQUE(organization_id, employee_code),
  UNIQUE(organization_id, email)
);

-- Add self-reference for reports_to after table creation
ALTER TABLE public.employees 
  ADD CONSTRAINT fk_employees_reports_to 
  FOREIGN KEY (reports_to) REFERENCES public.employees(id) ON DELETE SET NULL;

-- ============================================================
-- LEAVE BALANCES
-- ============================================================
CREATE TABLE public.leave_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id   UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year            INTEGER NOT NULL,
  
  total_days      INTEGER DEFAULT 0,
  used_days       INTEGER DEFAULT 0,
  pending_days    INTEGER DEFAULT 0,
  remaining_days  INTEGER DEFAULT 0,
  carry_over_days INTEGER DEFAULT 0,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(employee_id, leave_type_id, year)
);

-- ============================================================
-- LEAVE REQUESTS
-- ============================================================
CREATE TABLE public.leave_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id   UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE RESTRICT,
  
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  number_of_days  INTEGER NOT NULL,
  day_type        TEXT DEFAULT 'full' CHECK (day_type IN ('full', 'half-morning', 'half-afternoon')),
  
  reason          TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  
  requested_at    TIMESTAMPTZ DEFAULT now(),
  
  -- Approval
  approver_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at    TIMESTAMPTZ,
  approver_comments TEXT,
  
  -- Attachments
  attachment_url  TEXT,
  
  -- Replacement/Coverage
  replacement_id  UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  coverage_notes TEXT,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LEAVE ADJUSTMENT PROPOSALS
-- ============================================================
CREATE TABLE public.leave_adjustment_proposals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  leave_request_id UUID NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  
  proposed_start_date DATE NOT NULL,
  proposed_end_date DATE NOT NULL,
  reason          TEXT,
  
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  
  proposed_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  proposed_at    TIMESTAMPTZ DEFAULT now(),
  
  responded_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  responded_at    TIMESTAMPTZ,
  response_notes  TEXT,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PART 2
-- ============================================================
CREATE INDEX idx_leave_types_org ON public.leave_types(organization_id);
CREATE INDEX idx_employees_org ON public.employees(organization_id);
CREATE INDEX idx_employees_user ON public.employees(user_id);
CREATE INDEX idx_employees_email ON public.employees(email);
CREATE INDEX idx_employees_department ON public.employees(department_id);
CREATE INDEX idx_employees_position ON public.employees(position_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_employees_hire_date ON public.employees(hire_date);
CREATE INDEX idx_leave_balances_employee ON public.leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON public.leave_balances(year);
CREATE INDEX idx_leave_requests_org ON public.leave_requests(organization_id);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);
CREATE INDEX idx_leave_adjustment_proposals_request ON public.leave_adjustment_proposals(leave_request_id);
