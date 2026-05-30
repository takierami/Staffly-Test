import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { AuditLog, SystemSetting, UserSession } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type AuditLogInsert = Insert<'audit_logs'>;
export type AuditLogWithDetails = AuditLog & {
  user?: { id: string; email: string } | null;
};

export type SystemSettingInsert = Insert<'system_settings'>;
export type SystemSettingUpdate = Update<'system_settings'>;

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

const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Audit Logs
export const auditService = {
  async getLogs(filters?: {
    action?: string;
    entity_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<AuditLogWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:profiles!user_id(id, email)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }
    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
    return data || [];
  },

  async logAction(log: AuditLogInsert): Promise<AuditLog | null> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(log)
      .select()
      .single();

    if (error) {
      console.error('Error logging action:', error);
      return null;
    }
    return data;
  },

  async logCreate(entityType: string, entityId: string, newData: Record<string, unknown>): Promise<void> {
    const orgId = await getOrganizationId();
    const userId = await getCurrentUserId();
    if (!orgId) return;

    await this.logAction({
      organization_id: orgId,
      user_id: userId,
      action: 'CREATE',
      entity_type: entityType,
      entity_id: entityId,
      new_data: newData
    });
  },

  async logUpdate(entityType: string, entityId: string, oldData: Record<string, unknown>, newData: Record<string, unknown>): Promise<void> {
    const orgId = await getOrganizationId();
    const userId = await getCurrentUserId();
    if (!orgId) return;

    await this.logAction({
      organization_id: orgId,
      user_id: userId,
      action: 'UPDATE',
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData,
      new_data: newData
    });
  },

  async logDelete(entityType: string, entityId: string, oldData: Record<string, unknown>): Promise<void> {
    const orgId = await getOrganizationId();
    const userId = await getCurrentUserId();
    if (!orgId) return;

    await this.logAction({
      organization_id: orgId,
      user_id: userId,
      action: 'DELETE',
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData
    });
  },

  async getEntityHistory(entityType: string, entityId: string): Promise<AuditLogWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:profiles!user_id(id, email)
      `)
      .eq('organization_id', orgId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching entity history:', error);
      return [];
    }
    return data || [];
  },

  async exportLogs(startDate: string, endDate: string, format: 'json' | 'csv' = 'json'): Promise<string | null> {
    const logs = await this.getLogs({ start_date: startDate, end_date: endDate });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    if (logs.length === 0) return '';

    const headers = ['id', 'created_at', 'action', 'entity_type', 'entity_id', 'user_id'];
    const rows = logs.map(log =>
      headers.map(h => {
        const value = log[h as keyof AuditLog];
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value || '');
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  },

  async getActionStats(startDate: string, endDate: string): Promise<Record<string, number>> {
    const orgId = await getOrganizationId();
    if (!orgId) return {};

    const { data, error } = await supabase
      .from('audit_logs')
      .select('action')
      .eq('organization_id', orgId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error || !data) {
      console.error('Error fetching action stats:', error);
      return {};
    }

    const stats: Record<string, number> = {};
    data.forEach(log => {
      stats[log.action] = (stats[log.action] || 0) + 1;
    });

    return stats;
  }
};

// System Settings
export const systemSettingService = {
  async getAll(): Promise<SystemSetting[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('organization_id', orgId);

    if (error) {
      console.error('Error fetching system settings:', error);
      return [];
    }
    return data || [];
  },

  async get(key: string): Promise<SystemSetting | null> {
    const orgId = await getOrganizationId();
    if (!orgId) return null;

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('organization_id', orgId)
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error('Error fetching system setting:', error);
      return null;
    }
    return data;
  },

  async getValue<T>(key: string, defaultValue: T): Promise<T> {
    const setting = await this.get(key);
    if (!setting) return defaultValue;

    try {
      return JSON.parse(setting.value) as T;
    } catch {
      return setting.value as unknown as T;
    }
  },

  async set(key: string, value: unknown, description?: string, category?: string): Promise<SystemSetting | null> {
    const orgId = await getOrganizationId();
    if (!orgId) return null;

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    // Check if setting exists
    const existing = await this.get(key);

    if (existing) {
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          value: stringValue,
          description: description || existing.description,
          category: category || existing.category
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating system setting:', error);
        return null;
      }
      return data;
    }

    const { data, error } = await supabase
      .from('system_settings')
      .insert({
        organization_id: orgId,
        key,
        value: stringValue,
        description,
        category
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating system setting:', error);
      return null;
    }
    return data;
  },

  async delete(key: string): Promise<boolean> {
    const orgId = await getOrganizationId();
    if (!orgId) return false;

    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('organization_id', orgId)
      .eq('key', key);

    if (error) {
      console.error('Error deleting system setting:', error);
      return false;
    }
    return true;
  },

  async getByCategory(category: string): Promise<SystemSetting[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('organization_id', orgId)
      .eq('category', category);

    if (error) {
      console.error('Error fetching settings by category:', error);
      return [];
    }
    return data || [];
  }
};

// User Sessions
export const sessionService = {
  async getActiveSessions(): Promise<UserSession[]> {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('last_activity', { ascending: false });

    if (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
    return data || [];
  },

  async terminateSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error terminating session:', error);
      return false;
    }
    return true;
  },

  async terminateAllOtherSessions(): Promise<boolean> {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const currentSession = await supabase.auth.getSession();
    const currentSessionId = currentSession.data.session?.access_token;

    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .neq('id', currentSessionId || '');

    if (error) {
      console.error('Error terminating other sessions:', error);
      return false;
    }
    return true;
  },

  async updateLastActivity(): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const currentSession = await supabase.auth.getSession();
    const currentSessionId = currentSession.data.session?.access_token;

    if (!currentSessionId) return;

    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', currentSessionId);
  }
};
