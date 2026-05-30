import { supabase } from './supabaseClient';

export const subscriptionService = {
  async getSubscription(orgId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', orgId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
    return data;
  },

  async updateSubscription(id: string, updates: any) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllSubscriptions() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        organization:organizations(name, slug)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
