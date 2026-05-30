import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { AttendanceRecord } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type AttendanceRecordWithDetails = AttendanceRecord & {
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
};

export type AttendanceRecordInsert = Insert<'attendance_records'>;
export type AttendanceRecordUpdate = Update<'attendance_records'>;

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

const getCurrentEmployeeId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  return employee?.id || null;
};

export const attendanceService = {
  async getAll(filters?: {
    employee_id?: string;
    date?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<AttendanceRecordWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code)
      `)
      .eq('organization_id', orgId)
      .order('date', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.date) {
      query = query.eq('date', filters.date);
    }
    if (filters?.start_date) {
      query = query.gte('date', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('date', filters.end_date);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
    return data || [];
  },

  async getByEmployee(employeeId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching employee attendance:', error);
      return [];
    }
    return data || [];
  },

  async getByDate(date: string): Promise<AttendanceRecordWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        employee:employees!employee_id(id, first_name, last_name, employee_code)
      `)
      .eq('organization_id', orgId)
      .eq('date', date);

    if (error) {
      console.error('Error fetching attendance by date:', error);
      return [];
    }
    return data || [];
  },

  async checkIn(employeeId: string, notes?: string): Promise<AttendanceRecord | null> {
    const orgId = await getOrganizationId();
    if (!orgId) return null;

    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in
    const { data: existing } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      console.error('Already checked in today');
      return null;
    }

    const { data, error } = await supabase
      .from('attendance_records')
      .insert({
        organization_id: orgId,
        employee_id: employeeId,
        date: today,
        check_in: new Date().toISOString(),
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error checking in:', error);
      return null;
    }
    return data;
  },

  async checkOut(recordId: string, notes?: string): Promise<AttendanceRecord | null> {
    const { data, error } = await supabase
      .from('attendance_records')
      .update({
        check_out: new Date().toISOString(),
        notes: notes
      })
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      console.error('Error checking out:', error);
      return null;
    }
    return data;
  },

  async createRecord(record: AttendanceRecordInsert): Promise<AttendanceRecord | null> {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error creating attendance record:', error);
      return null;
    }
    return data;
  },

  async updateRecord(id: string, updates: AttendanceRecordUpdate): Promise<AttendanceRecord | null> {
    const { data, error } = await supabase
      .from('attendance_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating attendance record:', error);
      return null;
    }
    return data;
  },

  async deleteRecord(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting attendance record:', error);
      return false;
    }
    return true;
  },

  async getStats(startDate?: string, endDate?: string): Promise<{
    totalEmployees: number;
    present: number;
    absent: number;
    late: number;
    earlyDepartures: number;
    avgWorkHours: number;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { totalEmployees: 0, present: 0, absent: 0, late: 0, earlyDepartures: 0, avgWorkHours: 0 };

    const today = new Date().toISOString().split('T')[0];
    const targetDate = startDate || today;

    // Get total employees
    const { count: totalEmployees } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .is('deleted_at', null);

    // Get today's attendance
    const { data: records } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('organization_id', orgId)
      .eq('date', targetDate);

    if (!records) {
      return { totalEmployees: totalEmployees || 0, present: 0, absent: totalEmployees || 0, late: 0, earlyDepartures: 0, avgWorkHours: 0 };
    }

    const present = records.filter(r => r.check_in).length;
    const absent = (totalEmployees || 0) - present;
    const late = records.filter(r => r.is_late).length;
    const earlyDepartures = records.filter(r => r.is_early_departure).length;

    const totalHours = records.reduce((sum, r) => sum + (r.total_hours || 0), 0);
    const avgWorkHours = records.length > 0 ? totalHours / records.length : 0;

    return {
      totalEmployees: totalEmployees || 0,
      present,
      absent,
      late,
      earlyDepartures,
      avgWorkHours
    };
  },

  async getMonthlyReport(employeeId: string, year: number, month: number): Promise<{
    workDays: number;
    totalHours: number;
    avgHours: number;
    lateDays: number;
    absentDays: number;
    overtimeHours: number;
  }> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: records } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (!records || records.length === 0) {
      return { workDays: 0, totalHours: 0, avgHours: 0, lateDays: 0, absentDays: 0, overtimeHours: 0 };
    }

    const workDays = records.filter(r => r.check_in).length;
    const totalHours = records.reduce((sum, r) => sum + (r.total_hours || 0), 0);
    const avgHours = workDays > 0 ? totalHours / workDays : 0;
    const lateDays = records.filter(r => r.is_late).length;
    const absentDays = 22 - workDays; // Assuming 22 working days
    const overtimeHours = records.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);

    return { workDays, totalHours, avgHours, lateDays, absentDays, overtimeHours };
  },

  async getCurrentUserAttendance(): Promise<AttendanceRecord | null> {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return null;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current user attendance:', error);
      return null;
    }
    return data;
  }
};
