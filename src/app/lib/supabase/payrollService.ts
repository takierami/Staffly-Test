import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { PayrollRecord, PayrollEarning, PayrollDeduction } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type PayrollRecordWithDetails = PayrollRecord & {
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  earnings?: PayrollEarning[];
  deductions?: PayrollDeduction[];
};

export type PayrollRecordInsert = Insert<'payroll_records'>;
export type PayrollRecordUpdate = Update<'payroll_records'>;
export type PayrollEarningInsert = Insert<'payroll_earnings'>;
export type PayrollDeductionInsert = Insert<'payroll_deductions'>;

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

export const payrollService = {
  async getAll(filters?: {
    employee_id?: string;
    pay_period_month?: number;
    pay_period_year?: number;
    status?: string;
  }): Promise<PayrollRecordWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('payroll_records')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        earnings:payroll_earnings(*),
        deductions:payroll_deductions(*)
      `)
      .eq('organization_id', orgId)
      .order('pay_period_year', { ascending: false })
      .order('pay_period_month', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.pay_period_month) {
      query = query.eq('pay_period_month', filters.pay_period_month);
    }
    if (filters?.pay_period_year) {
      query = query.eq('pay_period_year', filters.pay_period_year);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching payroll records:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<PayrollRecordWithDetails | null> {
    const { data, error } = await supabase
      .from('payroll_records')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code),
        earnings:payroll_earnings(*),
        deductions:payroll_deductions(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching payroll record:', error);
      return null;
    }
    return data;
  },

  async create(record: PayrollRecordInsert): Promise<PayrollRecord | null> {
    const { data, error } = await supabase
      .from('payroll_records')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error creating payroll record:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: PayrollRecordUpdate): Promise<PayrollRecord | null> {
    const { data, error } = await supabase
      .from('payroll_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payroll record:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('payroll_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting payroll record:', error);
      return false;
    }
    return true;
  },

  // Earnings
  async addEarning(earning: PayrollEarningInsert): Promise<PayrollEarning | null> {
    const { data, error } = await supabase
      .from('payroll_earnings')
      .insert(earning)
      .select()
      .single();

    if (error) {
      console.error('Error adding earning:', error);
      return null;
    }
    return data;
  },

  async updateEarning(id: string, updates: Update<'payroll_earnings'>): Promise<PayrollEarning | null> {
    const { data, error } = await supabase
      .from('payroll_earnings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating earning:', error);
      return null;
    }
    return data;
  },

  async deleteEarning(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('payroll_earnings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting earning:', error);
      return false;
    }
    return true;
  },

  // Deductions
  async addDeduction(deduction: PayrollDeductionInsert): Promise<PayrollDeduction | null> {
    const { data, error } = await supabase
      .from('payroll_deductions')
      .insert(deduction)
      .select()
      .single();

    if (error) {
      console.error('Error adding deduction:', error);
      return null;
    }
    return data;
  },

  async updateDeduction(id: string, updates: Update<'payroll_deductions'>): Promise<PayrollDeduction | null> {
    const { data, error } = await supabase
      .from('payroll_deductions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deduction:', error);
      return null;
    }
    return data;
  },

  async deleteDeduction(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('payroll_deductions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting deduction:', error);
      return false;
    }
    return true;
  },

  // Process payroll
  async processPayroll(payrollId: string): Promise<boolean> {
    const { error } = await supabase
      .from('payroll_records')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', payrollId);

    if (error) {
      console.error('Error processing payroll:', error);
      return false;
    }
    return true;
  },

  async approvePayroll(payrollId: string, approvedBy: string): Promise<boolean> {
    const { error } = await supabase
      .from('payroll_records')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', payrollId);

    if (error) {
      console.error('Error approving payroll:', error);
      return false;
    }
    return true;
  },

  async payPayroll(payrollId: string): Promise<boolean> {
    const { error } = await supabase
      .from('payroll_records')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', payrollId);

    if (error) {
      console.error('Error marking payroll as paid:', error);
      return false;
    }
    return true;
  },

  // Stats
  async getStats(month?: number, year?: number): Promise<{
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    employeeCount: number;
    averageSalary: number;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { totalAmount: 0, paidAmount: 0, pendingAmount: 0, employeeCount: 0, averageSalary: 0 };

    let query = supabase
      .from('payroll_records')
      .select('net_salary, status')
      .eq('organization_id', orgId);

    if (month) {
      query = query.eq('pay_period_month', month);
    }
    if (year) {
      query = query.eq('pay_period_year', year);
    }

    const { data: records } = await query;

    if (!records) {
      return { totalAmount: 0, paidAmount: 0, pendingAmount: 0, employeeCount: 0, averageSalary: 0 };
    }

    const totalAmount = records.reduce((sum, r) => sum + (r.net_salary || 0), 0);
    const paidAmount = records.filter(r => r.status === 'paid').reduce((sum, r) => sum + (r.net_salary || 0), 0);
    const pendingAmount = records.filter(r => r.status !== 'paid').reduce((sum, r) => sum + (r.net_salary || 0), 0);
    const employeeCount = records.length;
    const averageSalary = employeeCount > 0 ? totalAmount / employeeCount : 0;

    return { totalAmount, paidAmount, pendingAmount, employeeCount, averageSalary };
  },

  async getMonthlyReport(year: number): Promise<{ month: number; total: number; count: number }[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('payroll_records')
      .select('pay_period_month, net_salary')
      .eq('organization_id', orgId)
      .eq('pay_period_year', year);

    if (error || !data) {
      console.error('Error fetching monthly report:', error);
      return [];
    }

    const monthlyData: Record<number, { total: number; count: number }> = {};

    data.forEach(record => {
      const month = record.pay_period_month;
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, count: 0 };
      }
      monthlyData[month].total += record.net_salary || 0;
      monthlyData[month].count += 1;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month: parseInt(month),
      total: data.total,
      count: data.count
    }));
  },

  async getEmployeePayrollHistory(employeeId: string): Promise<PayrollRecord[]> {
    const { data, error } = await supabase
      .from('payroll_records')
      .select('*')
      .eq('employee_id', employeeId)
      .order('pay_period_year', { ascending: false })
      .order('pay_period_month', { ascending: false });

    if (error) {
      console.error('Error fetching employee payroll history:', error);
      return [];
    }
    return data || [];
  }
};

type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
