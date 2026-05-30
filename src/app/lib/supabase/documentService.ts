import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { DocumentTemplate, Document, EmployeeDocument } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type DocumentTemplateWithDetails = DocumentTemplate & {
  department?: { id: string; name: string } | null;
};

export type DocumentWithDetails = Document & {
  template?: DocumentTemplate;
  employee?: { id: string; first_name: string; last_name: string };
  creator?: { id: string; first_name: string; last_name: string };
};

export type DocumentTemplateInsert = Insert<'document_templates'>;
export type DocumentTemplateUpdate = Update<'document_templates'>;
export type DocumentInsert = Insert<'documents'>;
export type DocumentUpdate = Update<'documents'>;
export type EmployeeDocumentInsert = Insert<'employee_documents'>;

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

export const documentService = {
  // Document Templates
  async getTemplates(filters?: {
    category?: string;
    department_id?: string;
    is_active?: boolean;
  }): Promise<DocumentTemplateWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('document_templates')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('organization_id', orgId)
      .order('name');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.department_id) {
      query = query.eq('department_id', filters.department_id);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching document templates:', error);
      return [];
    }
    return data || [];
  },

  async getTemplateById(id: string): Promise<DocumentTemplateWithDetails | null> {
    const { data, error } = await supabase
      .from('document_templates')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching document template:', error);
      return null;
    }
    return data;
  },

  async createTemplate(template: DocumentTemplateInsert): Promise<DocumentTemplate | null> {
    const { data, error } = await supabase
      .from('document_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      console.error('Error creating document template:', error);
      return null;
    }
    return data;
  },

  async updateTemplate(id: string, updates: DocumentTemplateUpdate): Promise<DocumentTemplate | null> {
    const { data, error } = await supabase
      .from('document_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document template:', error);
      return null;
    }
    return data;
  },

  async deleteTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('document_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document template:', error);
      return false;
    }
    return true;
  },

  // Documents
  async getDocuments(filters?: {
    employee_id?: string;
    template_id?: string;
    status?: string;
    category?: string;
  }): Promise<DocumentWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('documents')
      .select(`
        *,
        template:document_templates(*),
        employee:employees!employee_id(id, first_name, last_name),
        creator:profiles!created_by(id, first_name, last_name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    if (filters?.template_id) {
      query = query.eq('template_id', filters.template_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    return data || [];
  },

  async getDocumentById(id: string): Promise<DocumentWithDetails | null> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        template:document_templates(*),
        employee:employees!employee_id(id, first_name, last_name),
        creator:profiles!created_by(id, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching document:', error);
      return null;
    }
    return data;
  },

  async createDocument(document: DocumentInsert): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return null;
    }
    return data;
  },

  async updateDocument(id: string, updates: DocumentUpdate): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      return null;
    }
    return data;
  },

  async deleteDocument(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }
    return true;
  },

  async signDocument(id: string, signature: string): Promise<boolean> {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from('documents')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_data: signature
      })
      .eq('id', id);

    if (error) {
      console.error('Error signing document:', error);
      return false;
    }
    return true;
  },

  async archiveDocument(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('documents')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) {
      console.error('Error archiving document:', error);
      return false;
    }
    return true;
  },

  // Employee Documents
  async getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    const { data, error } = await supabase
      .from('employee_documents')
      .select('*, document:documents(*)')
      .eq('employee_id', employeeId);

    if (error) {
      console.error('Error fetching employee documents:', error);
      return [];
    }
    return data || [];
  },

  async attachDocumentToEmployee(attachment: EmployeeDocumentInsert): Promise<EmployeeDocument | null> {
    const { data, error } = await supabase
      .from('employee_documents')
      .insert(attachment)
      .select()
      .single();

    if (error) {
      console.error('Error attaching document to employee:', error);
      return null;
    }
    return data;
  },

  async detachDocumentFromEmployee(employeeId: string, documentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('employee_documents')
      .delete()
      .eq('employee_id', employeeId)
      .eq('document_id', documentId);

    if (error) {
      console.error('Error detaching document from employee:', error);
      return false;
    }
    return true;
  },

  // Stats
  async getStats(): Promise<{
    totalTemplates: number;
    activeDocuments: number;
    pendingSignatures: number;
    signedDocuments: number;
    expiredDocuments: number;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { totalTemplates: 0, activeDocuments: 0, pendingSignatures: 0, signedDocuments: 0, expiredDocuments: 0 };

    const { count: totalTemplates } = await supabase
      .from('document_templates')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const { count: activeDocuments } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active');

    const { count: pendingSignatures } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'pending_signature');

    const { count: signedDocuments } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'signed');

    const { count: expiredDocuments } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .lt('expires_at', new Date().toISOString());

    return {
      totalTemplates: totalTemplates || 0,
      activeDocuments: activeDocuments || 0,
      pendingSignatures: pendingSignatures || 0,
      signedDocuments: signedDocuments || 0,
      expiredDocuments: expiredDocuments || 0
    };
  }
};
