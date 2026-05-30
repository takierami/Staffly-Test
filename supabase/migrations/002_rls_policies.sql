-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's organization
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

------------------------------------------------------------
-- ORGANIZATIONS policies
------------------------------------------------------------
-- Super admins: full access
CREATE POLICY "super_admin_all_orgs" ON public.organizations
  FOR ALL USING (public.is_super_admin());

-- Org members: read own org only
CREATE POLICY "members_read_own_org" ON public.organizations
  FOR SELECT USING (id = public.get_user_org_id());

------------------------------------------------------------
-- PROFILES policies
------------------------------------------------------------
-- Super admins: full access to all profiles
CREATE POLICY "super_admin_all_profiles" ON public.profiles
  FOR ALL USING (public.is_super_admin());

-- Users: read profiles in same org
CREATE POLICY "members_read_org_profiles" ON public.profiles
  FOR SELECT USING (organization_id = public.get_user_org_id());

-- Users: update own profile
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Org admins: manage profiles in own org
CREATE POLICY "admin_manage_org_profiles" ON public.profiles
  FOR ALL USING (
    public.get_user_role() = 'admin'
    AND organization_id = public.get_user_org_id()
  );

------------------------------------------------------------
-- SUBSCRIPTIONS policies
------------------------------------------------------------
CREATE POLICY "super_admin_all_subs" ON public.subscriptions
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "admin_read_own_sub" ON public.subscriptions
  FOR SELECT USING (organization_id = public.get_user_org_id());

------------------------------------------------------------
-- ACTIVITY_LOGS policies
------------------------------------------------------------
CREATE POLICY "super_admin_all_logs" ON public.activity_logs
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "admin_read_org_logs" ON public.activity_logs
  FOR SELECT USING (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() IN ('admin', 'hr_manager')
  );

CREATE POLICY "users_insert_logs" ON public.activity_logs
  FOR INSERT WITH CHECK (
    actor_id = auth.uid()
    AND (organization_id = public.get_user_org_id() OR public.is_super_admin())
  );
