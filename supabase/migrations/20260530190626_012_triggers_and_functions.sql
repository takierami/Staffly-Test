/*
  # Database Triggers, Functions, and Initial Data
  
  ## Features:
  1. Auto-update updated_at timestamps
  2. Auto-generate employee codes
  3. Auto-create leave balances
  4. Update enrolled count on training enrollments
  5. Update applicant count on candidates
  6. Default leave types for new organizations
  7. Default grades for new organizations
  8. Audit trail trigger
  9. System document templates
*/

-- ============================================================
-- AUTO-UPDATE TIMESTAMPS FOR ALL NEW TABLES
-- ============================================================
-- Triggers are created dynamically

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'departments', 'positions', 'employee_categories', 'grades',
    'leave_types', 'employees', 'leave_balances', 'leave_requests',
    'leave_adjustment_proposals', 'attendance_records', 'payroll_records',
    'performance_reviews', 'performance_goals', 'job_postings', 'candidates',
    'candidate_notes', 'training_programs', 'training_enrollments',
    'document_templates', 'documents', 'promotion_rules', 'promotion_records',
    'system_settings', 'user_sessions', 'employee_emergency_contacts',
    'employee_documents', 'notifications'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS tr_%s_updated ON public.%s;
       CREATE TRIGGER tr_%s_updated BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      tbl, tbl, tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- AUTO-GENERATE EMPLOYEE CODE
-- ============================================================
CREATE OR REPLACE FUNCTION generate_employee_code()
RETURNS TRIGGER AS $$
DECLARE
  org_prefix TEXT;
  next_num INTEGER;
BEGIN
  IF NEW.employee_code IS NULL OR NEW.employee_code = '' THEN
    SELECT SUBSTRING(slug FROM 1 FOR 3) INTO org_prefix
    FROM public.organizations WHERE id = NEW.organization_id;
    
    IF org_prefix IS NULL THEN
      org_prefix := 'EMP';
    END IF;
    
    SELECT COALESCE(MAX(
      CASE 
        WHEN employee_code ~ '^\d+$' THEN employee_code::INTEGER
        WHEN employee_code ~ '^[A-Z]+\d+$' THEN SUBSTRING(employee_code FROM '\d+')::INTEGER
        ELSE 0
      END
    ), 0) + 1
    INTO next_num
    FROM public.employees
    WHERE organization_id = NEW.organization_id;
    
    NEW.employee_code := UPPER(org_prefix) || LPAD(next_num::TEXT, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_employee_code
  BEFORE INSERT ON public.employees
  FOR EACH ROW EXECUTE FUNCTION generate_employee_code();

-- ============================================================
-- AUTO-CREATE LEAVE BALANCES FOR NEW EMPLOYEES
-- ============================================================
CREATE OR REPLACE FUNCTION create_initial_leave_balances()
RETURNS TRIGGER AS $$
DECLARE
  lt RECORD;
  current_year INTEGER := EXTRACT(YEAR FROM now());
BEGIN
  FOR lt IN 
    SELECT id, default_days 
    FROM public.leave_types 
    WHERE organization_id = NEW.organization_id AND is_active = true
  LOOP
    INSERT INTO public.leave_balances (
      organization_id, employee_id, leave_type_id, year,
      total_days, remaining_days
    ) VALUES (
      NEW.organization_id, NEW.id, lt.id, current_year,
      lt.default_days, lt.default_days
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_create_leave_balances
  AFTER INSERT ON public.employees
  FOR EACH ROW EXECUTE FUNCTION create_initial_leave_balances();

-- ============================================================
-- UPDATE TRAINING ENROLLED COUNT
-- ============================================================
CREATE OR REPLACE FUNCTION update_training_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.training_programs
    SET enrolled_count = enrolled_count + 1
    WHERE id = NEW.training_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.training_programs
    SET enrolled_count = GREATEST(enrolled_count - 1, 0)
    WHERE id = OLD.training_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_training_enrollment_insert
  AFTER INSERT ON public.training_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_training_enrolled_count();

CREATE TRIGGER tr_training_enrollment_delete
  AFTER DELETE ON public.training_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_training_enrolled_count();

-- ============================================================
-- UPDATE JOB APPLICANT COUNT
-- ============================================================
CREATE OR REPLACE FUNCTION update_job_applicant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.job_postings
    SET applicant_count = applicant_count + 1
    WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.job_postings
    SET applicant_count = GREATEST(applicant_count - 1, 0)
    WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_candidate_insert
  AFTER INSERT ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION update_job_applicant_count();

CREATE TRIGGER tr_candidate_delete
  AFTER DELETE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION update_job_applicant_count();

-- ============================================================
-- AUTO-CREATE DEFAULT DATA FOR NEW ORGANIZATIONS
-- ============================================================
CREATE OR REPLACE FUNCTION create_org_defaults()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.grades (organization_id, name, name_ar, code, level, description) VALUES
    (NEW.id, 'Grade 1 - Entry', 'الرتبة 1 - مبتدئ', 'G1', 1, 'Entry level position'),
    (NEW.id, 'Grade 2 - Junior', 'الرتبة 2 - مبتدئ', 'G2', 2, 'Junior level position'),
    (NEW.id, 'Grade 3 - Intermediate', 'الرتبة 3 - متوسط', 'G3', 3, 'Intermediate level position'),
    (NEW.id, 'Grade 4 - Senior', 'الرتبة 4 - أول', 'G4', 4, 'Senior level position'),
    (NEW.id, 'Grade 5 - Lead', 'الرتبة 5 - رئيس', 'G5', 5, 'Team lead position'),
    (NEW.id, 'Grade 6 - Principal', 'الرتبة 6 - رئيسي', 'G6', 6, 'Principal level position'),
    (NEW.id, 'Grade 7 - Manager', 'الرتبة 7 - مدير', 'G7', 7, 'Manager position'),
    (NEW.id, 'Grade 8 - Director', 'الرتبة 8 - مدير عام', 'G8', 8, 'Director position'),
    (NEW.id, 'Grade 9 - VP', 'الرتبة 9 - نائب رئيس', 'G9', 9, 'Vice President position'),
    (NEW.id, 'Grade 10 - Executive', 'الرتبة 10 - تنفيذي', 'G10', 10, 'Executive position');
  
  INSERT INTO public.leave_types (organization_id, name, name_ar, code, default_days, is_paid, color) VALUES
    (NEW.id, 'Annual Leave', 'إجازة سنوية', 'ANNUAL', 30, true, '#3B82F6'),
    (NEW.id, 'Sick Leave', 'إجازة مرضية', 'SICK', 15, true, '#F59E0B'),
    (NEW.id, 'Unpaid Leave', 'إجازة بدون راتب', 'UNPAID', 0, false, '#6B7280'),
    (NEW.id, 'Maternity Leave', 'إجازة أمومة', 'MATERNITY', 90, true, '#EC4899'),
    (NEW.id, 'Paternity Leave', 'إجازة أبوة', 'PATERNITY', 3, true, '#8B5CF6'),
    (NEW.id, 'Marriage Leave', 'إجازة زواج', 'MARRIAGE', 3, true, '#F97316'),
    (NEW.id, 'Bereavement Leave', 'إجازة عزاء', 'BEREAVEMENT', 5, true, '#1F2937');
  
  INSERT INTO public.departments (organization_id, name, name_ar, code) VALUES
    (NEW.id, 'Executive', 'الإدارة التنفيذية', 'EXEC'),
    (NEW.id, 'Human Resources', 'الموارد البشرية', 'HR'),
    (NEW.id, 'Finance', 'المالية', 'FIN'),
    (NEW.id, 'Operations', 'العمليات', 'OPS'),
    (NEW.id, 'Information Technology', 'تقنية المعلومات', 'IT'),
    (NEW.id, 'Marketing', 'التسويق', 'MKT'),
    (NEW.id, 'Sales', 'المبيعات', 'SALES');
  
  INSERT INTO public.document_templates (organization_id, name, name_ar, document_type, content, fields, is_system) VALUES
    (NEW.id, 'Work Certificate', 'شهادة عمل', 'work_certificate', 
     'WORK CERTIFICATE

We, the undersigned, certify that {{employee_full_name}}, holder of National ID {{employee_id}}, has been working in our company as {{employee_position}} in the {{employee_department}} department since {{employee_hire_date}}.

This certificate is issued at the request of the concerned party for any lawful purpose.

Date: {{current_date}}

HR Department', 
     ARRAY['employee_full_name', 'employee_id', 'employee_position', 'employee_department', 'employee_hire_date', 'current_date'],
     true),
    
    (NEW.id, 'Salary Certificate', 'شهادة راتب', 'salary_certificate',
     'SALARY CERTIFICATE

This is to certify that {{employee_full_name}} is currently employed in our company as {{employee_position}} in the {{employee_department}} department since {{employee_hire_date}}.

The employee gross monthly salary is {{employee_salary}}.

This certificate is issued for {{employee_full_name}} personal use.

Date: {{current_date}}

HR Department',
     ARRAY['employee_full_name', 'employee_position', 'employee_department', 'employee_hire_date', 'employee_salary', 'current_date'],
     true);
  
  INSERT INTO public.system_settings (organization_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_create_org_defaults
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION create_org_defaults();

-- ============================================================
-- LEAVE BALANCE UPDATE ON LEAVE REQUEST STATUS CHANGE
-- ============================================================
CREATE OR REPLACE FUNCTION update_leave_balance_on_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.leave_balances
    SET 
      used_days = used_days + NEW.number_of_days,
      pending_days = GREATEST(pending_days - NEW.number_of_days, 0),
      remaining_days = remaining_days - NEW.number_of_days
    WHERE employee_id = NEW.employee_id 
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    UPDATE public.leave_balances
    SET pending_days = GREATEST(pending_days - NEW.number_of_days, 0)
    WHERE employee_id = NEW.employee_id 
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  
  ELSIF NEW.status = 'pending' AND OLD.status != 'pending' THEN
    UPDATE public.leave_balances
    SET pending_days = pending_days + NEW.number_of_days
    WHERE employee_id = NEW.employee_id 
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_leave_balance
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_leave_balance_on_change();

CREATE OR REPLACE FUNCTION update_pending_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    UPDATE public.leave_balances
    SET pending_days = pending_days + NEW.number_of_days
    WHERE employee_id = NEW.employee_id 
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_pending_insert
  AFTER INSERT ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_pending_on_insert();

-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION get_employee_name(emp_id UUID)
RETURNS TEXT AS $$
  SELECT first_name || ' ' || last_name FROM public.employees WHERE id = emp_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION count_working_days(start_date DATE, end_date DATE, org_id UUID)
RETURNS INTEGER AS $$
DECLARE
  work_days INTEGER[];
  count INTEGER := 0;
  d DATE;
BEGIN
  SELECT work_days INTO work_days
  FROM public.system_settings
  WHERE organization_id = org_id;
  
  IF work_days IS NULL THEN
    work_days := ARRAY[1,2,3,4,5];
  END IF;
  
  FOR d IN SELECT generate_series(start_date, end_date, '1 day'::interval)::date LOOP
    IF EXTRACT(DOW FROM d)::INTEGER = ANY(work_days) THEN
      count := count + 1;
    END IF;
  END LOOP;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_org_stats(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_employees', (SELECT COUNT(*) FROM employees WHERE organization_id = org_id),
    'active_employees', (SELECT COUNT(*) FROM employees WHERE organization_id = org_id AND status = 'active'),
    'departments_count', (SELECT COUNT(*) FROM departments WHERE organization_id = org_id),
    'pending_leaves', (SELECT COUNT(*) FROM leave_requests WHERE organization_id = org_id AND status = 'pending'),
    'open_positions', (SELECT COUNT(*) FROM job_postings WHERE organization_id = org_id AND status = 'open'),
    'active_trainings', (SELECT COUNT(*) FROM training_programs WHERE organization_id = org_id AND status = 'in-progress')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
