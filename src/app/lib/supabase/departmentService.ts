import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { Department, Position, Grade, EmployeeCategory } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type DepartmentWithDetails = Department & {
  manager?: { id: string; first_name: string; last_name: string } | null;
  employeeCount?: number;
};

export type PositionWithDetails = Position & {
  department?: { id: string; name: string } | null;
};

export type DepartmentInsert = Insert<'departments'>;
export type DepartmentUpdate = Update<'departments'>;
export type PositionInsert = Insert<'positions'>;
export type PositionUpdate = Update<'positions'>;
export type GradeInsert = Insert<'grades'>;
export type GradeUpdate = Update<'grades'>;
export type EmployeeCategoryInsert = Insert<'employee_categories'>;
export type EmployeeCategoryUpdate = Update<'employee_categories'>;

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

// Departments
export const departmentService = {
  async getAll(): Promise<DepartmentWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        manager:employees!manager_id(id, first_name, last_name)
      `)
      .eq('organization_id', orgId)
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      return [];
    }

    // Get employee count for each department
    const departmentsWithCount = await Promise.all((data || []).map(async (dept) => {
      const { count } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('department_id', dept.id)
        .is('deleted_at', null);

      return { ...dept, employeeCount: count || 0 };
    }));

    return departmentsWithCount;
  },

  async getById(id: string): Promise<DepartmentWithDetails | null> {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        manager:employees!manager_id(id, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching department:', error);
      return null;
    }

    if (data) {
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('department_id', data.id)
        .is('deleted_at', null);

      return { ...data, employeeCount: employeeCount || 0 };
    }

    return data;
  },

  async create(department: DepartmentInsert): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single();

    if (error) {
      console.error('Error creating department:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: DepartmentUpdate): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating department:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting department:', error);
      return false;
    }
    return true;
  },

  async getPositions(departmentId: string): Promise<Position[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('organization_id', orgId)
      .eq('department_id', departmentId)
      .order('title');

    if (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
    return data || [];
  }
};

// Positions
export const positionService = {
  async getAll(filters?: { department_id?: string }): Promise<PositionWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('positions')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('organization_id', orgId)
      .order('title');

    if (filters?.department_id) {
      query = query.eq('department_id', filters.department_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<PositionWithDetails | null> {
    const { data, error } = await supabase
      .from('positions')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching position:', error);
      return null;
    }
    return data;
  },

  async create(position: PositionInsert): Promise<Position | null> {
    const { data, error } = await supabase
      .from('positions')
      .insert(position)
      .select()
      .single();

    if (error) {
      console.error('Error creating position:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: PositionUpdate): Promise<Position | null> {
    const { data, error } = await supabase
      .from('positions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating position:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting position:', error);
      return false;
    }
    return true;
  }
};

// Grades
export const gradeService = {
  async getAll(): Promise<Grade[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('organization_id', orgId)
      .order('level');

    if (error) {
      console.error('Error fetching grades:', error);
      return [];
    }
    return data || [];
  },

  async create(grade: GradeInsert): Promise<Grade | null> {
    const { data, error } = await supabase
      .from('grades')
      .insert(grade)
      .select()
      .single();

    if (error) {
      console.error('Error creating grade:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: GradeUpdate): Promise<Grade | null> {
    const { data, error } = await supabase
      .from('grades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating grade:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting grade:', error);
      return false;
    }
    return true;
  }
};

// Employee Categories
export const employeeCategoryService = {
  async getAll(): Promise<EmployeeCategory[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('employee_categories')
      .select('*')
      .eq('organization_id', orgId)
      .order('name');

    if (error) {
      console.error('Error fetching employee categories:', error);
      return [];
    }
    return data || [];
  },

  async create(category: EmployeeCategoryInsert): Promise<EmployeeCategory | null> {
    const { data, error } = await supabase
      .from('employee_categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error creating employee category:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: EmployeeCategoryUpdate): Promise<EmployeeCategory | null> {
    const { data, error } = await supabase
      .from('employee_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee category:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('employee_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee category:', error);
      return false;
    }
    return true;
  }
};
