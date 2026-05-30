import { supabase } from './supabaseClient';

export const organizationService = {
  async getOrganizations() {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getOrganization(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateOrganization(id: string, updates: any) {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getOrganizationStats(id: string) {
    // In a real app, this might call an RPC or edge function
    // For now, we return mock stats structure
    return {
      activeUsers: 0,
      totalStorage: 0
    };
  }
};
