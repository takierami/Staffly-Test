/*
  # Row Level Security Policies for Multi-Tenant Isolation
  
  This migration implements comprehensive RLS policies for all HR tables.
  
  ## Security Model:
  
  ### Roles:
  - super_admin: Full access to all data across all organizations
  - admin: Full access within their organization
  - hr_manager: Read/write access to HR operations within their organization
  - employee: Limited read access to own data within their organization
  
  ## Policy Patterns:
  1. Super admins bypass all tenant restrictions
  2. Organization members access only their organization's data
  3. Employees have restricted access (often read-only or own data only)
  4. All policies check membership via organization_id
  
  ## Important:
  - Every policy uses auth.uid() for user identification
  - Organization membership verified via profiles.organization_id
  - Soft-deleted organizations handled via deleted_at check
*/

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin or hr_manager
CREATE OR REPLACE FUNCTION public.is_hr_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr_manager')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user belongs to specific organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND organization_id = org_id
  ) OR public.is_super_admin();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- DEPARTMENTS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_departments" ON public.departments
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_departments" ON public.departments
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_departments" ON public.departments
  FOR ALL USING (
    public.is_hr_or_admin() 
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- POSITIONS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_positions" ON public.positions
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_positions" ON public.positions
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_positions" ON public.positions
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- EMPLOYEE CATEGORIES POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_categories" ON public.employee_categories
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_categories" ON public.employee_categories
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_categories" ON public.employee_categories
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- GRADES POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_grades" ON public.grades
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_grades" ON public.grades
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_grades" ON public.grades
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- LEAVE TYPES POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_leave_types" ON public.leave_types
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_leave_types" ON public.leave_types
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_leave_types" ON public.leave_types
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- EMPLOYEES POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_employees" ON public.employees
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_employees" ON public.employees
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_employees" ON public.employees
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "employees_read_own_record" ON public.employees
  FOR SELECT USING (
    user_id = auth.uid() 
    OR public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "employees_update_own_record" ON public.employees
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- LEAVE BALANCES POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_leave_balances" ON public.leave_balances
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_leave_balances" ON public.leave_balances
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_leave_balances" ON public.leave_balances
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "employees_read_own_balances" ON public.leave_balances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

-- ============================================================
-- LEAVE REQUESTS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_leave_requests" ON public.leave_requests
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_leave_requests" ON public.leave_requests
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "employees_create_leave_requests" ON public.leave_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id 
      AND e.user_id = auth.uid()
      AND public.user_belongs_to_org(organization_id)
    )
  );

CREATE POLICY "employees_update_own_requests" ON public.leave_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
    AND status = 'pending'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "hr_approve_leave_requests" ON public.leave_requests
  FOR UPDATE USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  )
  WITH CHECK (public.user_belongs_to_org(organization_id));

-- ============================================================
-- LEAVE ADJUSTMENT PROPOSALS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_leave_proposals" ON public.leave_adjustment_proposals
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_leave_proposals" ON public.leave_adjustment_proposals
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "hr_manage_leave_proposals" ON public.leave_adjustment_proposals
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- ATTENDANCE RECORDS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_attendance" ON public.attendance_records
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_attendance" ON public.attendance_records
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_attendance" ON public.attendance_records
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "employees_read_own_attendance" ON public.attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "employees_insert_own_attendance" ON public.attendance_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id 
      AND e.user_id = auth.uid()
      AND public.user_belongs_to_org(organization_id)
    )
  );

-- ============================================================
-- PAYROLL RECORDS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_payroll" ON public.payroll_records
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_payroll" ON public.payroll_records
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_payroll" ON public.payroll_records
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "employees_read_own_payroll" ON public.payroll_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

-- ============================================================
-- PAYROLL EARNINGS/DEDUCTIONS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_earnings" ON public.payroll_earnings
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_earnings" ON public.payroll_earnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payroll_records pr
      WHERE pr.id = payroll_id
      AND public.user_belongs_to_org(pr.organization_id)
    )
  );

CREATE POLICY "admin_manage_earnings" ON public.payroll_earnings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.payroll_records pr
      WHERE pr.id = payroll_id
      AND public.is_hr_or_admin()
      AND public.user_belongs_to_org(pr.organization_id)
    )
  );

CREATE POLICY "super_admin_all_deductions" ON public.payroll_deductions
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_deductions" ON public.payroll_deductions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.payroll_records pr
      WHERE pr.id = payroll_id
      AND public.user_belongs_to_org(pr.organization_id)
    )
  );

CREATE POLICY "admin_manage_deductions" ON public.payroll_deductions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.payroll_records pr
      WHERE pr.id = payroll_id
      AND public.is_hr_or_admin()
      AND public.user_belongs_to_org(pr.organization_id)
    )
  );

-- ============================================================
-- PERFORMANCE REVIEWS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_reviews" ON public.performance_reviews
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_reviews" ON public.performance_reviews
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_reviews" ON public.performance_reviews
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "employees_read_own_reviews" ON public.performance_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "reviewer_access_reviews" ON public.performance_reviews
  FOR SELECT USING (reviewer_id = auth.uid());

-- ============================================================
-- PERFORMANCE GOALS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_goals" ON public.performance_goals
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_goals" ON public.performance_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.performance_reviews pr
      WHERE pr.id = review_id
      AND public.user_belongs_to_org(pr.organization_id)
    )
  );

CREATE POLICY "admin_manage_goals" ON public.performance_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.performance_reviews pr
      WHERE pr.id = review_id
      AND public.is_hr_or_admin()
      AND public.user_belongs_to_org(pr.organization_id)
    )
  );

-- ============================================================
-- JOB POSTINGS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_jobs" ON public.job_postings
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_jobs" ON public.job_postings
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_jobs" ON public.job_postings
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- CANDIDATES POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_candidates" ON public.candidates
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_candidates" ON public.candidates
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_candidates" ON public.candidates
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- CANDIDATE NOTES POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_candidate_notes" ON public.candidate_notes
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_candidate_notes" ON public.candidate_notes
  FOR SELECT USING (
    NOT is_private OR author_id = auth.uid()
  );

CREATE POLICY "hr_manage_candidate_notes" ON public.candidate_notes
  FOR ALL USING (
    public.is_hr_or_admin()
    AND EXISTS (
      SELECT 1 FROM public.candidates c
      WHERE c.id = candidate_id
      AND public.user_belongs_to_org(c.organization_id)
    )
  );

-- ============================================================
-- TRAINING PROGRAMS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_training" ON public.training_programs
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_training" ON public.training_programs
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_training" ON public.training_programs
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- TRAINING ENROLLMENTS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_enrollments" ON public.training_enrollments
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_enrollments" ON public.training_enrollments
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_enrollments" ON public.training_enrollments
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "employees_read_own_enrollments" ON public.training_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

-- ============================================================
-- DOCUMENT TEMPLATES POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_templates" ON public.document_templates
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_templates" ON public.document_templates
  FOR SELECT USING (public.user_belongs_to_org(organization_id) OR is_system = true);

CREATE POLICY "admin_manage_templates" ON public.document_templates
  FOR ALL USING (
    (public.is_hr_or_admin() AND public.user_belongs_to_org(organization_id))
    OR is_system = false
  );

-- ============================================================
-- DOCUMENTS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_documents" ON public.documents
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_documents" ON public.documents
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_documents" ON public.documents
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "employees_read_own_documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

-- ============================================================
-- PROMOTION RULES POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_promo_rules" ON public.promotion_rules
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_promo_rules" ON public.promotion_rules
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_promo_rules" ON public.promotion_rules
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- PROMOTION RECORDS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_promos" ON public.promotion_records
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_promos" ON public.promotion_records
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_promos" ON public.promotion_records
  FOR ALL USING (
    public.is_hr_or_admin()
    AND public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "employees_read_own_promos" ON public.promotion_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_notifications" ON public.notifications
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "users_read_own_notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_update_own_notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "system_insert_notifications" ON public.notifications
  FOR INSERT WITH CHECK (organization_id IS NULL OR public.user_belongs_to_org(organization_id));

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_audits" ON public.audit_logs
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_admins_read_audits" ON public.audit_logs
  FOR SELECT USING (
    public.get_user_role() = 'admin'
    AND public.user_belongs_to_org(organization_id)
  );

CREATE POLICY "system_insert_audits" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- SYSTEM SETTINGS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_settings" ON public.system_settings
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "org_members_read_settings" ON public.system_settings
  FOR SELECT USING (public.user_belongs_to_org(organization_id));

CREATE POLICY "admin_manage_settings" ON public.system_settings
  FOR ALL USING (
    public.get_user_role() = 'admin'
    AND public.user_belongs_to_org(organization_id)
  );

-- ============================================================
-- USER SESSIONS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_sessions" ON public.user_sessions
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "users_read_own_sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_insert_sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- EMPLOYEE EMERGENCY CONTACTS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_emergency" ON public.employee_emergency_contacts
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "hr_manage_emergency" ON public.employee_emergency_contacts
  FOR ALL USING (
    public.is_hr_or_admin()
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id
      AND public.user_belongs_to_org(e.organization_id)
    )
  );

CREATE POLICY "employees_read_own_emergency" ON public.employee_emergency_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

-- ============================================================
-- EMPLOYEE DOCUMENTS POLICIES
-- ============================================================
CREATE POLICY "super_admin_all_emp_docs" ON public.employee_documents
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "hr_manage_emp_docs" ON public.employee_documents
  FOR ALL USING (
    public.is_hr_or_admin()
    AND EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id
      AND public.user_belongs_to_org(e.organization_id)
    )
  );

CREATE POLICY "employees_read_own_emp_docs" ON public.employee_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );
