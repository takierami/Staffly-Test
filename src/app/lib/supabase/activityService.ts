import { supabase } from './supabaseClient';

export const activityService = {
  async logActivity(action: string, entityType?: string, entityId?: string, metadata?: any) {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata || {}
      });
    
    // We typically don't throw on activity log failure to not break main flow
    if (error) {
      console.error('Failed to log activity:', error);
    }
  },

  async getActivityLogs(filters?: { orgId?: string, limit?: number }) {
    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        actor:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false });
      
    if (filters?.orgId) {
      query = query.eq('organization_id', filters.orgId);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPlatformActivity(limit: number = 50) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        actor:profiles(full_name, email),
        organization:organizations(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  }
};
