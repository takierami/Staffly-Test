import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { TrainingProgram, TrainingEnrollment } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type TrainingProgramWithDetails = TrainingProgram & {
  department?: { id: string; name: string } | null;
  instructor?: { id: string; first_name: string; last_name: string } | null;
};

export type TrainingEnrollmentWithDetails = TrainingEnrollment & {
  training_program: TrainingProgram;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string } | null;
};

export type TrainingProgramInsert = Insert<'training_programs'>;
export type TrainingProgramUpdate = Update<'training_programs'>;
export type TrainingEnrollmentInsert = Insert<'training_enrollments'>;
export type TrainingEnrollmentUpdate = Update<'training_enrollments'>;

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

export const trainingService = {
  // Training Programs
  async getPrograms(filters?: {
    status?: string;
    department_id?: string;
    category?: string;
    search?: string;
  }): Promise<TrainingProgramWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('training_programs')
      .select(`
        *,
        department:departments(id, name),
        instructor:employees!instructor_id(id, first_name, last_name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.department_id) {
      query = query.eq('department_id', filters.department_id);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching training programs:', error);
      return [];
    }
    return data || [];
  },

  async getProgramById(id: string): Promise<TrainingProgramWithDetails | null> {
    const { data, error } = await supabase
      .from('training_programs')
      .select(`
        *,
        department:departments(id, name),
        instructor:employees!instructor_id(id, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching training program:', error);
      return null;
    }
    return data;
  },

  async createProgram(program: TrainingProgramInsert): Promise<TrainingProgram | null> {
    const { data, error } = await supabase
      .from('training_programs')
      .insert(program)
      .select()
      .single();

    if (error) {
      console.error('Error creating training program:', error);
      return null;
    }
    return data;
  },

  async updateProgram(id: string, updates: TrainingProgramUpdate): Promise<TrainingProgram | null> {
    const { data, error } = await supabase
      .from('training_programs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating training program:', error);
      return null;
    }
    return data;
  },

  async deleteProgram(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('training_programs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting training program:', error);
      return false;
    }
    return true;
  },

  async publishProgram(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('training_programs')
      .update({ status: 'published', is_active: true })
      .eq('id', id);

    if (error) {
      console.error('Error publishing program:', error);
      return false;
    }
    return true;
  },

  async archiveProgram(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('training_programs')
      .update({ status: 'archived', is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error archiving program:', error);
      return false;
    }
    return true;
  },

  // Enrollments
  async getEnrollments(filters?: {
    program_id?: string;
    employee_id?: string;
    status?: string;
  }): Promise<TrainingEnrollmentWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('training_enrollments')
      .select(`
        *,
        training_program:training_programs(*),
        employee:employees!employee_id(id, first_name, last_name, employee_code)
      `)
      .eq('organization_id', orgId)
      .order('enrollment_date', { ascending: false });

    if (filters?.program_id) {
      query = query.eq('program_id', filters.program_id);
    }
    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
    return data || [];
  },

  async getEnrollmentById(id: string): Promise<TrainingEnrollmentWithDetails | null> {
    const { data, error } = await supabase
      .from('training_enrollments')
      .select(`
        *,
        training_program:training_programs(*),
        employee:employees!employee_id(id, first_name, last_name, employee_code)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching enrollment:', error);
      return null;
    }
    return data;
  },

  async enroll(enrollment: TrainingEnrollmentInsert): Promise<TrainingEnrollment | null> {
    const { data, error } = await supabase
      .from('training_enrollments')
      .insert(enrollment)
      .select()
      .single();

    if (error) {
      console.error('Error creating enrollment:', error);
      return null;
    }
    return data;
  },

  async updateEnrollment(id: string, updates: TrainingEnrollmentUpdate): Promise<TrainingEnrollment | null> {
    const { data, error } = await supabase
      .from('training_enrollments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating enrollment:', error);
      return null;
    }
    return data;
  },

  async startTraining(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('training_enrollments')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error starting training:', error);
      return false;
    }
    return true;
  },

  async completeTraining(id: string, score?: number, passed?: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('training_enrollments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score,
        passed: passed ?? (score !== undefined ? score >= 70 : true)
      })
      .eq('id', id);

    if (error) {
      console.error('Error completing training:', error);
      return false;
    }
    return true;
  },

  async cancelEnrollment(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('training_enrollments')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling enrollment:', error);
      return false;
    }
    return true;
  },

  // Bulk enroll
  async bulkEnroll(programId: string, employeeIds: string[]): Promise<number> {
    const orgId = await getOrganizationId();
    if (!orgId) return 0;

    const enrollments = employeeIds.map(employeeId => ({
      organization_id: orgId,
      program_id: programId,
      employee_id: employeeId,
      status: 'enrolled' as const,
      enrollment_date: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('training_enrollments')
      .insert(enrollments)
      .select();

    if (error) {
      console.error('Error bulk enrolling:', error);
      return 0;
    }
    return data?.length || 0;
  },

  // Stats
  async getStats(): Promise<{
    activePrograms: number;
    totalEnrollments: number;
    completed: number;
    inProgress: number;
    averageScore: number;
    completionRate: number;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { activePrograms: 0, totalEnrollments: 0, completed: 0, inProgress: 0, averageScore: 0, completionRate: 0 };

    const { count: activePrograms } = await supabase
      .from('training_programs')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_active', true);

    const { data: enrollments } = await supabase
      .from('training_enrollments')
      .select('status, score')
      .eq('organization_id', orgId);

    if (!enrollments) {
      return { activePrograms: activePrograms || 0, totalEnrollments: 0, completed: 0, inProgress: 0, averageScore: 0, completionRate: 0 };
    }

    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
    const scores = enrollments.filter(e => e.score !== null).map(e => e.score as number);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const completionRate = enrollments.length > 0 ? (completed / enrollments.length) * 100 : 0;

    return {
      activePrograms: activePrograms || 0,
      totalEnrollments: enrollments.length,
      completed,
      inProgress,
      averageScore,
      completionRate
    };
  },

  async getEmployeeTrainingHistory(employeeId: string): Promise<{
    enrollments: TrainingEnrollmentWithDetails[];
    totalCompleted: number;
    totalInProgress: number;
    averageScore: number;
  }> {
    const { data: enrollments } = await supabase
      .from('training_enrollments')
      .select(`
        *,
        training_program:training_programs(*),
        employee:employees!employee_id(id, first_name, last_name, employee_code)
      `)
      .eq('employee_id', employeeId)
      .order('enrollment_date', { ascending: false });

    if (!enrollments) {
      return { enrollments: [], totalCompleted: 0, totalInProgress: 0, averageScore: 0 };
    }

    const completed = enrollments.filter(e => e.status === 'completed');
    const inProgress = enrollments.filter(e => e.status === 'in_progress');
    const scores = completed.filter(e => e.score !== null).map(e => e.score as number);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      enrollments: enrollments as TrainingEnrollmentWithDetails[],
      totalCompleted: completed.length,
      totalInProgress: inProgress.length,
      averageScore
    };
  }
};
