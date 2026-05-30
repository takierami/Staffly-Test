import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { PerformanceReview, PerformanceGoal } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type PerformanceReviewWithDetails = PerformanceReview & {
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  reviewer?: { id: string; first_name: string; last_name: string };
};

export type PerformanceGoalWithDetails = PerformanceGoal & {
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
};

export type PerformanceReviewInsert = Insert<'performance_reviews'>;
export type PerformanceReviewUpdate = Update<'performance_reviews'>;
export type PerformanceGoalInsert = Insert<'performance_goals'>;
export type PerformanceGoalUpdate = Update<'performance_goals'>;

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

export const performanceService = {
  // Performance Reviews
  async getReviews(filters?: {
    employee_id?: string;
    status?: string;
    review_period?: string;
  }): Promise<PerformanceReviewWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('performance_reviews')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        reviewer:employees!reviewer_id(id, first_name, last_name)
      `)
      .eq('organization_id', orgId)
      .order('review_date', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.review_period) {
      query = query.eq('review_period', filters.review_period);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching performance reviews:', error);
      return [];
    }
    return data || [];
  },

  async getReviewById(id: string): Promise<PerformanceReviewWithDetails | null> {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        reviewer:employees!reviewer_id(id, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching performance review:', error);
      return null;
    }
    return data;
  },

  async createReview(review: PerformanceReviewInsert): Promise<PerformanceReview | null> {
    const { data, error } = await supabase
      .from('performance_reviews')
      .insert(review)
      .select()
      .single();

    if (error) {
      console.error('Error creating performance review:', error);
      return null;
    }
    return data;
  },

  async updateReview(id: string, updates: PerformanceReviewUpdate): Promise<PerformanceReview | null> {
    const { data, error } = await supabase
      .from('performance_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating performance review:', error);
      return null;
    }
    return data;
  },

  async submitReview(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('performance_reviews')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error submitting review:', error);
      return false;
    }
    return true;
  },

  async deleteReview(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('performance_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting review:', error);
      return false;
    }
    return true;
  },

  // Performance Goals
  async getGoals(filters?: {
    employee_id?: string;
    status?: string;
    year?: number;
  }): Promise<PerformanceGoalWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('performance_goals')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching performance goals:', error);
      return [];
    }
    return data || [];
  },

  async getGoalById(id: string): Promise<PerformanceGoalWithDetails | null> {
    const { data, error } = await supabase
      .from('performance_goals')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching performance goal:', error);
      return null;
    }
    return data;
  },

  async createGoal(goal: PerformanceGoalInsert): Promise<PerformanceGoal | null> {
    const { data, error } = await supabase
      .from('performance_goals')
      .insert(goal)
      .select()
      .single();

    if (error) {
      console.error('Error creating performance goal:', error);
      return null;
    }
    return data;
  },

  async updateGoal(id: string, updates: PerformanceGoalUpdate): Promise<PerformanceGoal | null> {
    const { data, error } = await supabase
      .from('performance_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating performance goal:', error);
      return null;
    }
    return data;
  },

  async updateGoalProgress(id: string, progress: number): Promise<boolean> {
    const status = progress >= 100 ? 'completed' : 'in_progress';
    const completedAt = progress >= 100 ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('performance_goals')
      .update({ progress, status, completed_at: completedAt })
      .eq('id', id);

    if (error) {
      console.error('Error updating goal progress:', error);
      return false;
    }
    return true;
  },

  async deleteGoal(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('performance_goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
    return true;
  },

  // Stats
  async getStats(): Promise<{
    pendingReviews: number;
    completedReviews: number;
    averageRating: number;
    goalsInProgress: number;
    goalsCompleted: number;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { pendingReviews: 0, completedReviews: 0, averageRating: 0, goalsInProgress: 0, goalsCompleted: 0 };

    const { data: reviews } = await supabase
      .from('performance_reviews')
      .select('status, overall_rating')
      .eq('organization_id', orgId);

    const { data: goals } = await supabase
      .from('performance_goals')
      .select('status')
      .eq('organization_id', orgId);

    const pendingReviews = reviews?.filter(r => r.status === 'pending' || r.status === 'in_progress').length || 0;
    const completedReviews = reviews?.filter(r => r.status === 'completed').length || 0;
    const ratings = reviews?.filter(r => r.overall_rating !== null).map(r => r.overall_rating as number) || [];
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    const goalsInProgress = goals?.filter(g => g.status === 'in_progress').length || 0;
    const goalsCompleted = goals?.filter(g => g.status === 'completed').length || 0;

    return { pendingReviews, completedReviews, averageRating, goalsInProgress, goalsCompleted };
  },

  async getEmployeePerformanceHistory(employeeId: string): Promise<{
    reviews: PerformanceReview[];
    goals: PerformanceGoal[];
    averageRating: number;
  }> {
    const { data: reviews } = await supabase
      .from('performance_reviews')
      .select('*')
      .eq('employee_id', employeeId)
      .order('review_date', { ascending: false });

    const { data: goals } = await supabase
      .from('performance_goals')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    const ratings = reviews?.filter(r => r.overall_rating !== null).map(r => r.overall_rating as number) || [];
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      reviews: reviews || [],
      goals: goals || [],
      averageRating
    };
  }
};
