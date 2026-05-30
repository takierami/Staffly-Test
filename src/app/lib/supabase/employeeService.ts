import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { Employee, Department, Position, Grade, LeaveBalance } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type EmployeeWithDetails = Employee & {
  department?: Department | null;
  position?: Position | null;
  grade?: Grade | null;
  manager?: Employee | null;
  leave_balances?: LeaveBalance[];
};

export type EmployeeInsert = Insert<'employees'>;
export type EmployeeUpdate = Update<'employees'>;

const getOrganizationId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  return profile?.organization_id || null;
};

export const employeeService = {
  async getAll(filters?: {
    department_id?: string;
    status?: string;
    search?: string;
  }): Promise<EmployeeWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('employees')
      .select(`
        *,
        department:departments(*),
        position:positions(*),
        grade:grades(*),
        manager:employees!manager_id(*),
        leave_balances(*)
      `)
      .eq('organization_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filters?.department_id) {
      query = query.eq('department_id', filters.department_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,employee_code.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<EmployeeWithDetails | null> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(*),
        position:positions(*),
        grade:grades(*),
        manager:employees!manager_id(*),
        leave_balances(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
    return data;
  },

  async create(employee: EmployeeInsert): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: EmployeeUpdate): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      return null;
    }
    return data;
  },

  async softDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('employees')
      .update({ deleted_at: new Date().toISOString(), status: 'terminated' })
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
    return true;
  },

  async getByDepartment(departmentId: string): Promise<Employee[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('organization_id', orgId)
      .eq('department_id', departmentId)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching employees by department:', error);
      return [];
    }
    return data || [];
  },

  async getManagers(): Promise<Employee[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('organization_id', orgId)
      .in('role', ['admin', 'manager'])
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching managers:', error);
      return [];
    }
    return data || [];
  },

  async getStats(): Promise<{
    total: number;
    active: number;
    onLeave: number;
    terminated: number;
    byDepartment: Record<string, number>;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { total: 0, active: 0, onLeave: 0, terminated: 0, byDepartment: {} };

    const { data: employees } = await supabase
      .from('employees')
      .select('status, department_id')
      .eq('organization_id', orgId)
      .is('deleted_at', null);

    if (!employees) {
      return { total: 0, active: 0, onLeave: 0, terminated: 0, byDepartment: {} };
    }

    const stats = {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      onLeave: employees.filter(e => e.status === 'on_leave').length,
      terminated: employees.filter(e => e.status === 'terminated').length,
      byDepartment: {} as Record<string, number>
    };

    employees.forEach(emp => {
      if (emp.department_id) {
        stats.byDepartment[emp.department_id] = (stats.byDepartment[emp.department_id] || 0) + 1;
      }
    });

    return stats;
  },

  async search(query: string): Promise<Employee[]> {
    const orgId = await getOrganizationId();
    if (!orgId || !query) return [];

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('organization_id', orgId)
      .is('deleted_at', null)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,employee_code.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching employees:', error);
      return [];
    }
    return data || [];
  }
};
