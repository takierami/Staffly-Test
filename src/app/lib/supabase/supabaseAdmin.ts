import { supabase } from './supabaseClient';

/**
 * Client-side wrapper that calls Supabase Edge Functions
 * for privileged operations (invite users, create orgs, etc.)
 * 
 * The service_role key is NEVER exposed to the frontend.
 * All admin actions are routed through Edge Functions.
 */
export const supabaseAdmin = {
  /**
   * Invokes the create-organization Edge Function
   */
  async createOrganization(data: any) {
    const { data: response, error } = await supabase.functions.invoke('create-organization', {
      body: data
    });
    
    if (error) throw error;
    return response;
  },

  /**
   * Invokes the invite-user Edge Function
   */
  async inviteUser(email: string, role: string, orgId: string) {
    const { data: response, error } = await supabase.functions.invoke('invite-user', {
      body: { email, role, organization_id: orgId }
    });
    
    if (error) throw error;
    return response;
  },

  /**
   * Invokes the manage-organization Edge Function
   */
  async manageOrganization(orgId: string, action: string) {
    const { data: response, error } = await supabase.functions.invoke('manage-organization', {
      body: { organization_id: orgId, action }
    });
    
    if (error) throw error;
    return response;
  }
};
