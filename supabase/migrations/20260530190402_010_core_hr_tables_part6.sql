/*
  # Core HR Tables - Part 6: Notifications, Audit, Settings
  
  ## New Tables:
  - `notifications` - User notifications
  - `audit_logs` - Detailed audit trail
  - `system_settings` - Organization-specific settings
  - `user_sessions` - User session tracking
  - `employee_emergency_contacts` - Emergency contact information
  - `employee_documents` - Employee personal documents
*/

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT,
  
  data            JSONB DEFAULT '{}',
  
  is_read         BOOLEAN DEFAULT false,
  read_at         TIMESTAMPTZ,
  
  action_url      TEXT,
  
  priority        TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  expires_at      TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  
  actor_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email     TEXT,
  actor_name      TEXT,
  
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT,
  
  old_values      JSONB,
  new_values      JSONB,
  
  ip_address      TEXT,
  user_agent      TEXT,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
CREATE TABLE public.system_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Company Info
  company_name    TEXT,
  company_logo    TEXT,
  company_address TEXT,
  company_phone   TEXT,
  company_email   TEXT,
  company_website TEXT,
  
  -- Localization
  default_language TEXT DEFAULT 'en',
  default_currency TEXT DEFAULT 'DZD',
  default_timezone TEXT DEFAULT 'Africa/Algiers',
  date_format     TEXT DEFAULT 'YYYY-MM-DD',
  time_format     TEXT DEFAULT '24h',
  
  -- Work Schedule
  work_start_time TIME DEFAULT '09:00',
  work_end_time   TIME DEFAULT '17:00',
  work_days       INTEGER[] DEFAULT '{1,2,3,4,5}',
  
  -- Security
  require_2fa     BOOLEAN DEFAULT false,
  session_timeout INTEGER DEFAULT 30,
  password_expiry_days INTEGER DEFAULT 90,
  require_strong_password BOOLEAN DEFAULT true,
  
  -- Notifications
  email_notifications_enabled BOOLEAN DEFAULT true,
  email_sender_name TEXT,
  email_sender_address TEXT,
  
  -- Appearance
  primary_color  TEXT,
  logo_url       TEXT,
  favicon_url    TEXT,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USER SESSIONS
-- ============================================================
CREATE TABLE public.user_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  session_token   TEXT NOT NULL,
  ip_address      TEXT,
  user_agent      TEXT,
  device_type     TEXT,
  
  login_at        TIMESTAMPTZ DEFAULT now(),
  logout_at       TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  
  is_active       BOOLEAN DEFAULT true,
  
  metadata        JSONB DEFAULT '{}',
  
  UNIQUE(session_token)
);

-- ============================================================
-- EMPLOYEE EMERGENCY CONTACTS
-- ============================================================
CREATE TABLE public.employee_emergency_contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  name            TEXT NOT NULL,
  relationship    TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  
  is_primary      BOOLEAN DEFAULT false,
  priority        INTEGER DEFAULT 0,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- EMPLOYEE DOCUMENTS (Personal documents)
-- ============================================================
CREATE TABLE public.employee_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  
  document_type   TEXT NOT NULL,
  document_name   TEXT NOT NULL,
  document_number TEXT,
  
  issue_date      DATE,
  expiry_date     DATE,
  issuing_authority TEXT,
  
  file_url        TEXT,
  file_size       INTEGER,
  
  is_verified     BOOLEAN DEFAULT false,
  verified_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at     TIMESTAMPTZ,
  
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PART 6
-- ============================================================
CREATE INDEX idx_notifications_org ON public.notifications(organization_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

CREATE INDEX idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

CREATE INDEX idx_system_settings_org ON public.system_settings(organization_id);

CREATE INDEX idx_user_sessions_org ON public.user_sessions(organization_id);
CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active) WHERE is_active = true;

CREATE INDEX idx_employee_emergency_contacts_employee ON public.employee_emergency_contacts(employee_id);
CREATE INDEX idx_employee_emergency_contacts_primary ON public.employee_emergency_contacts(employee_id, is_primary) WHERE is_primary = true;

CREATE INDEX idx_employee_documents_employee ON public.employee_documents(employee_id);
CREATE INDEX idx_employee_documents_type ON public.employee_documents(document_type);
CREATE INDEX idx_employee_documents_expiry ON public.employee_documents(expiry_date);

-- Enable RLS on all new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_adjustment_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
