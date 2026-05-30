import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { LeaveType, LeaveBalance, LeaveRequest, LeaveAdjustmentProposal } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type LeaveRequestWithDetails = LeaveRequest & {
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  leave_type?: LeaveType;
  approver?: { id: string; first_name: string; last_name: string };
};

export type LeaveRequestInsert = Insert<'leave_requests'>;
export type LeaveRequestUpdate = Update<'leave_requests'>;
export type LeaveBalanceInsert = Insert<'leave_balances'>;
export type LeaveAdjustmentInsert = Insert<'leave_adjustment_proposals'>;

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

export const leaveService = {
  // Leave Types
  async getLeaveTypes(): Promise<LeaveType[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .eq('organization_id', orgId)
      .order('name');

    if (error) {
      console.error('Error fetching leave types:', error);
      return [];
    }
    return data || [];
  },

  async createLeaveType(type: Insert<'leave_types'>): Promise<LeaveType | null> {
    const { data, error } = await supabase
      .from('leave_types')
      .insert(type)
      .select()
      .single();

    if (error) {
      console.error('Error creating leave type:', error);
      return null;
    }
    return data;
  },

  // Leave Balances
  async getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    const { data, error } = await supabase
      .from('leave_balances')
      .select('*, leave_type:leave_types(*)')
      .eq('employee_id', employeeId);

    if (error) {
      console.error('Error fetching leave balances:', error);
      return [];
    }
    return data || [];
  },

  async updateLeaveBalance(id: string, updates: Update<'leave_balances'>): Promise<LeaveBalance | null> {
    const { data, error } = await supabase
      .from('leave_balances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating leave balance:', error);
      return null;
    }
    return data;
  },

  // Leave Requests
  async getRequests(filters?: {
    employee_id?: string;
    status?: string;
    leave_type_id?: string;
  }): Promise<LeaveRequestWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        leave_type:leave_types(*),
        approver:employees!approved_by(id, first_name, last_name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.leave_type_id) {
      query = query.eq('leave_type_id', filters.leave_type_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }
    return data || [];
  },

  async getRequestById(id: string): Promise<LeaveRequestWithDetails | null> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        leave_type:leave_types(*),
        approver:employees!approved_by(id, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching leave request:', error);
      return null;
    }
    return data;
  },

  async createRequest(request: LeaveRequestInsert): Promise<LeaveRequest | null> {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(request)
      .select()
      .single();

    if (error) {
      console.error('Error creating leave request:', error);
      return null;
    }
    return data;
  },

  async updateRequest(id: string, updates: LeaveRequestUpdate): Promise<LeaveRequest | null> {
    const { data, error } = await supabase
      .from('leave_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating leave request:', error);
      return null;
    }
    return data;
  },

  async approveRequest(id: string, approverId: string, notes?: string): Promise<boolean> {
    const { error } = await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        approval_notes: notes
      })
      .eq('id', id);

    if (error) {
      console.error('Error approving leave request:', error);
      return false;
    }
    return true;
  },

  async rejectRequest(id: string, approverId: string, reason: string): Promise<boolean> {
    const { error } = await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', id);

    if (error) {
      console.error('Error rejecting leave request:', error);
      return false;
    }
    return true;
  },

  async cancelRequest(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('leave_requests')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling leave request:', error);
      return false;
    }
    return true;
  },

  // Leave Adjustments
  async getAdjustments(employeeId?: string): Promise<LeaveAdjustmentProposal[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('leave_adjustment_proposals')
      .select(`
        *,
        leave_type:leave_types(*),
        proposed_by_user:profiles!proposed_by(*),
        reviewed_by_user:profiles!reviewed_by(*)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching leave adjustments:', error);
      return [];
    }
    return data || [];
  },

  async createAdjustment(adjustment: LeaveAdjustmentInsert): Promise<LeaveAdjustmentProposal | null> {
    const { data, error } = await supabase
      .from('leave_adjustment_proposals')
      .insert(adjustment)
      .select()
      .single();

    if (error) {
      console.error('Error creating leave adjustment:', error);
      return null;
    }
    return data;
  },

  async processAdjustment(id: string, action: 'approved' | 'rejected', reviewerId: string, notes?: string): Promise<boolean> {
    const { error } = await supabase
      .from('leave_adjustment_proposals')
      .update({
        status: action,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        review_notes: notes
      })
      .eq('id', id);

    if (error) {
      console.error('Error processing leave adjustment:', error);
      return false;
    }
    return true;
  },

  // Stats
  async getStats(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    totalDaysRequested: number;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { pending: 0, approved: 0, rejected: 0, cancelled: 0, totalDaysRequested: 0 };

    const { data: requests } = await supabase
      .from('leave_requests')
      .select('status, total_days')
      .eq('organization_id', orgId);

    if (!requests) {
      return { pending: 0, approved: 0, rejected: 0, cancelled: 0, totalDaysRequested: 0 };
    }

    return {
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
      totalDaysRequested: requests.reduce((sum, r) => sum + (r.total_days || 0), 0)
    };
  },

  // Team Calendar
  async getTeamCalendar(startDate: string, endDate: string): Promise<LeaveRequestWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        leave_type:leave_types(*),
        approver:employees!approved_by(id, first_name, last_name)
      `)
      .eq('organization_id', orgId)
      .eq('status', 'approved')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
      .order('start_date');

    if (error) {
      console.error('Error fetching team calendar:', error);
      return [];
    }
    return data || [];
  }
};
