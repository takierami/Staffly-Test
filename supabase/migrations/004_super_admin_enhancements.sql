-- 1. Enhance organizations table
ALTER TABLE public.organizations 
  ADD COLUMN deleted_at TIMESTAMPTZ,
  ADD COLUMN health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  ADD COLUMN suspension_reason TEXT,
  ADD COLUMN suspended_at TIMESTAMPTZ,
  ADD COLUMN max_users INTEGER DEFAULT 10;

-- 2. Platform Settings
CREATE TABLE public.platform_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode BOOLEAN DEFAULT false,
  global_banner   TEXT,
  feature_flags   JSONB DEFAULT '{}',
  updated_at      TIMESTAMPTZ DEFAULT now(),
  updated_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
-- Ensure only one row exists for global settings
CREATE UNIQUE INDEX idx_single_platform_settings ON public.platform_settings ((1));

-- 3. Impersonation Logs
CREATE TABLE public.impersonation_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason          TEXT,
  started_at      TIMESTAMPTZ DEFAULT now(),
  ended_at        TIMESTAMPTZ
);

-- 4. Security Events
CREATE TABLE public.security_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_id       UUID,
  event_type      TEXT NOT NULL,
  severity        TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address      TEXT,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 5. RLS Policies for new tables
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Platform Settings: Everyone can read, only super admins can update
CREATE POLICY "everyone_read_platform_settings" ON public.platform_settings
  FOR SELECT USING (true);

CREATE POLICY "super_admin_all_platform_settings" ON public.platform_settings
  FOR ALL USING (public.is_super_admin());

-- Impersonation Logs & Security Events: Super admins only
CREATE POLICY "super_admin_all_impersonation" ON public.impersonation_logs
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "super_admin_all_security_events" ON public.security_events
  FOR ALL USING (public.is_super_admin());

-- Update existing organization RLS policies to respect soft deletion
-- We drop the existing policy and recreate it with the deleted_at check.
DROP POLICY IF EXISTS "members_read_own_org" ON public.organizations;
CREATE POLICY "members_read_own_org" ON public.organizations
  FOR SELECT USING (id = public.get_user_org_id() AND deleted_at IS NULL);

-- (Super admins bypass deleted_at and can see everything via super_admin_all_orgs)

-- Insert default platform settings row
INSERT INTO public.platform_settings (maintenance_mode, feature_flags) 
VALUES (false, '{"enable_new_billing": false, "beta_analytics": true}');
