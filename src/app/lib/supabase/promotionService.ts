import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { PromotionRule, PromotionRecord } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type PromotionRecordWithDetails = PromotionRecord & {
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  from_position?: { id: string; title: string } | null;
  to_position?: { id: string; title: string };
  from_grade?: { id: string; name: string; level: number } | null;
  to_grade?: { id: string; name: string; level: number };
  approved_by_user?: { id: string; first_name: string; last_name: string } | null;
};

export type PromotionRuleInsert = Insert<'promotion_rules'>;
export type PromotionRuleUpdate = Update<'promotion_rules'>;
export type PromotionRecordInsert = Insert<'promotion_records'>;
export type PromotionRecordUpdate = Update<'promotion_records'>;

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

export const promotionService = {
  // Promotion Rules
  async getRules(): Promise<PromotionRule[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('promotion_rules')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching promotion rules:', error);
      return [];
    }
    return data || [];
  },

  async createRule(rule: PromotionRuleInsert): Promise<PromotionRule | null> {
    const { data, error } = await supabase
      .from('promotion_rules')
      .insert(rule)
      .select()
      .single();

    if (error) {
      console.error('Error creating promotion rule:', error);
      return null;
    }
    return data;
  },

  async updateRule(id: string, updates: PromotionRuleUpdate): Promise<PromotionRule | null> {
    const { data, error } = await supabase
      .from('promotion_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating promotion rule:', error);
      return null;
    }
    return data;
  },

  async deleteRule(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('promotion_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting promotion rule:', error);
      return false;
    }
    return true;
  },

  // Promotion Records
  async getRecords(filters?: {
    employee_id?: string;
    status?: string;
    year?: number;
  }): Promise<PromotionRecordWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('promotion_records')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        from_position:positions!from_position_id(id, title),
        to_position:positions!to_position_id(id, title),
        from_grade:grades!from_grade_id(id, name, level),
        to_grade:grades!to_grade_id(id, name, level),
        approved_by_user:profiles!approved_by(id, first_name, last_name)
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
      query = query.gte('promotion_date', `${filters.year}-01-01`)
                   .lte('promotion_date', `${filters.year}-12-31`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching promotion records:', error);
      return [];
    }
    return data || [];
  },

  async getRecordById(id: string): Promise<PromotionRecordWithDetails | null> {
    const { data, error } = await supabase
      .from('promotion_records')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        from_position:positions!from_position_id(id, title),
        to_position:positions!to_position_id(id, title),
        from_grade:grades!from_grade_id(id, name, level),
        to_grade:grades!to_grade_id(id, name, level),
        approved_by_user:profiles!approved_by(id, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching promotion record:', error);
      return null;
    }
    return data;
  },

  async createRecord(record: PromotionRecordInsert): Promise<PromotionRecord | null> {
    const { data, error } = await supabase
      .from('promotion_records')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error creating promotion record:', error);
      return null;
    }
    return data;
  },

  async updateRecord(id: string, updates: PromotionRecordUpdate): Promise<PromotionRecord | null> {
    const { data, error } = await supabase
      .from('promotion_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating promotion record:', error);
      return null;
    }
    return data;
  },

  async approvePromotion(id: string, approvedBy: string, notes?: string): Promise<boolean> {
    const { error } = await supabase
      .from('promotion_records')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        approval_notes: notes
      })
      .eq('id', id);

    if (error) {
      console.error('Error approving promotion:', error);
      return false;
    }
    return true;
  },

  async rejectPromotion(id: string, rejectedBy: string, reason: string): Promise<boolean> {
    const { error } = await supabase
      .from('promotion_records')
      .update({
        status: 'rejected',
        approved_by: rejectedBy,
        approved_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', id);

    if (error) {
      console.error('Error rejecting promotion:', error);
      return false;
    }
    return true;
  },

  async executePromotion(id: string): Promise<boolean> {
    // Get the promotion record
    const record = await this.getRecordById(id);
    if (!record || record.status !== 'approved') {
      console.error('Promotion not found or not approved');
      return false;
    }

    // Update the employee
    const { error: updateError } = await supabase
      .from('employees')
      .update({
        position_id: record.to_position_id,
        grade_id: record.to_grade_id,
        base_salary: record.new_salary || undefined
      })
      .eq('id', record.employee_id);

    if (updateError) {
      console.error('Error updating employee:', updateError);
      return false;
    }

    // Mark promotion as executed
    const { error } = await supabase
      .from('promotion_records')
      .update({ status: 'executed' })
      .eq('id', id);

    if (error) {
      console.error('Error executing promotion:', error);
      return false;
    }
    return true;
  },

  async cancelPromotion(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('promotion_records')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Error cancelling promotion:', error);
      return false;
    }
    return true;
  },

  // Stats
  async getStats(): Promise<{
    pending: number;
    approved: number;
    executed: number;
    rejected: number;
    totalThisYear: number;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { pending: 0, approved: 0, executed: 0, rejected: 0, totalThisYear: 0 };

    const currentYear = new Date().getFullYear();

    const { data: records } = await supabase
      .from('promotion_records')
      .select('status, promotion_date')
      .eq('organization_id', orgId);

    if (!records) {
      return { pending: 0, approved: 0, executed: 0, rejected: 0, totalThisYear: 0 };
    }

    return {
      pending: records.filter(r => r.status === 'pending').length,
      approved: records.filter(r => r.status === 'approved').length,
      executed: records.filter(r => r.status === 'executed').length,
      rejected: records.filter(r => r.status === 'rejected').length,
      totalThisYear: records.filter(r => r.promotion_date?.startsWith(`${currentYear}`)).length
    };
  },

  async getEmployeePromotionHistory(employeeId: string): Promise<PromotionRecordWithDetails[]> {
    const { data, error } = await supabase
      .from('promotion_records')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        from_position:positions!from_position_id(id, title),
        to_position:positions!to_position_id(id, title),
        from_grade:grades!from_grade_id(id, name, level),
        to_grade:grades!to_grade_id(id, name, level),
        approved_by_user:profiles!approved_by(id, first_name, last_name)
      `)
      .eq('employee_id', employeeId)
      .eq('status', 'executed')
      .order('promotion_date', { ascending: false });

    if (error) {
      console.error('Error fetching employee promotion history:', error);
      return [];
    }
    return data || [];
  },

  // Eligibility check
  async checkEligibility(employeeId: string): Promise<{
    eligible: boolean;
    reason?: string;
    nextEligibleDate?: string;
  }> {
    // Get employee
    const { data: employee } = await supabase
      .from('employees')
      .select('*, position:positions(*), grade:grades(*)')
      .eq('id', employeeId)
      .maybeSingle();

    if (!employee) {
      return { eligible: false, reason: 'Employee not found' };
    }

    // Check minimum time in position
    const lastPromotion = await supabase
      .from('promotion_records')
      .select('promotion_date')
      .eq('employee_id', employeeId)
      .eq('status', 'executed')
      .order('promotion_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastPromotion.data) {
      const monthsSinceLastPromotion = Math.floor(
        (Date.now() - new Date(lastPromotion.data.promotion_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      // Minimum 12 months between promotions
      if (monthsSinceLastPromotion < 12) {
        const nextDate = new Date(lastPromotion.data.promotion_date);
        nextDate.setMonth(nextDate.getMonth() + 12);
        return {
          eligible: false,
          reason: `Minimum 12 months required between promotions. ${12 - monthsSinceLastPromotion} months remaining.`,
          nextEligibleDate: nextDate.toISOString().split('T')[0]
        };
      }
    }

    return { eligible: true };
  }
};
