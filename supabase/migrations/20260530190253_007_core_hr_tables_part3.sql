/*
  # Core HR Tables - Part 3: Attendance & Payroll
  
  ## New Tables:
  - `attendance_records` - Daily attendance tracking
  - `payroll_records` - Monthly payroll records
  - `payroll_earnings` - Payroll earnings breakdown
  - `payroll_deductions` - Payroll deductions breakdown
*/

-- ============================================================
-- ATTENDANCE RECORDS
-- ============================================================
CREATE TABLE public.attendance_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  date            DATE NOT NULL,
  check_in        TIME,
  check_out       TIME,
  hours_worked    DECIMAL(5,2),
  
  status          TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half-day', 'holiday', 'weekend')),
  
  location        TEXT,
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  
  notes           TEXT,
  ip_address      TEXT,
  
  is_manual_entry BOOLEAN DEFAULT false,
  approved_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(employee_id, date)
);

-- ============================================================
-- PAYROLL RECORDS
-- ============================================================
CREATE TABLE public.payroll_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  payroll_period  TEXT NOT NULL,
  pay_date        DATE,
  
  -- Salary Components
  basic_salary    INTEGER DEFAULT 0,
  overtime_hours  DECIMAL(5,2) DEFAULT 0,
  overtime_amount INTEGER DEFAULT 0,
  
  -- Totals
  total_earnings  INTEGER DEFAULT 0,
  total_deductions INTEGER DEFAULT 0,
  net_salary      INTEGER DEFAULT 0,
  
  currency        TEXT DEFAULT 'DZD',
  
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid', 'cancelled')),
  
  processed_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  processed_at    TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(employee_id, payroll_period)
);

-- ============================================================
-- PAYROLL EARNINGS (Breakdown)
-- ============================================================
CREATE TABLE public.payroll_earnings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id      UUID NOT NULL REFERENCES public.payroll_records(id) ON DELETE CASCADE,
  
  type            TEXT NOT NULL,
  description     TEXT,
  amount          INTEGER DEFAULT 0,
  
  is_taxable      BOOLEAN DEFAULT true,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PAYROLL DEDUCTIONS (Breakdown)
-- ============================================================
CREATE TABLE public.payroll_deductions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id      UUID NOT NULL REFERENCES public.payroll_records(id) ON DELETE CASCADE,
  
  type            TEXT NOT NULL,
  description     TEXT,
  amount          INTEGER DEFAULT 0,
  
  is_pretax       BOOLEAN DEFAULT false,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PART 3
-- ============================================================
CREATE INDEX idx_attendance_records_org ON public.attendance_records(organization_id);
CREATE INDEX idx_attendance_records_employee ON public.attendance_records(employee_id);
CREATE INDEX idx_attendance_records_date ON public.attendance_records(date);
CREATE INDEX idx_attendance_records_status ON public.attendance_records(status);
CREATE INDEX idx_attendance_records_employee_date ON public.attendance_records(employee_id, date);

CREATE INDEX idx_payroll_records_org ON public.payroll_records(organization_id);
CREATE INDEX idx_payroll_records_employee ON public.payroll_records(employee_id);
CREATE INDEX idx_payroll_records_period ON public.payroll_records(payroll_period);
CREATE INDEX idx_payroll_records_status ON public.payroll_records(status);
CREATE INDEX idx_payroll_records_org_period ON public.payroll_records(organization_id, payroll_period);

CREATE INDEX idx_payroll_earnings_payroll ON public.payroll_earnings(payroll_id);
CREATE INDEX idx_payroll_deductions_payroll ON public.payroll_deductions(payroll_id);
