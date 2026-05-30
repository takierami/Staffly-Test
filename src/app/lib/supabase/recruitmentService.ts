import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { JobPosting, Candidate, CandidateNote } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type JobPostingWithDetails = JobPosting & {
  department?: { id: string; name: string } | null;
  position?: { id: string; title: string } | null;
};

export type CandidateWithDetails = Candidate & {
  job?: JobPosting;
  interviewer?: { id: string; first_name: string; last_name: string } | null;
};

export type JobPostingInsert = Insert<'job_postings'>;
export type JobPostingUpdate = Update<'job_postings'>;
export type CandidateInsert = Insert<'candidates'>;
export type CandidateUpdate = Update<'candidates'>;
export type CandidateNoteInsert = Insert<'candidate_notes'>;

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

export const recruitmentService = {
  // Job Postings
  async getJobs(filters?: {
    status?: string;
    department_id?: string;
    search?: string;
  }): Promise<JobPostingWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('job_postings')
      .select(`
        *,
        department:departments(id, name),
        position:positions(id, title)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.department_id) {
      query = query.eq('department_id', filters.department_id);
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching job postings:', error);
      return [];
    }
    return data || [];
  },

  async getJobById(id: string): Promise<JobPostingWithDetails | null> {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        department:departments(id, name),
        position:positions(id, title)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching job posting:', error);
      return null;
    }
    return data;
  },

  async createJob(job: JobPostingInsert): Promise<JobPosting | null> {
    const { data, error } = await supabase
      .from('job_postings')
      .insert(job)
      .select()
      .single();

    if (error) {
      console.error('Error creating job posting:', error);
      return null;
    }
    return data;
  },

  async updateJob(id: string, updates: JobPostingUpdate): Promise<JobPosting | null> {
    const { data, error } = await supabase
      .from('job_postings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job posting:', error);
      return null;
    }
    return data;
  },

  async deleteJob(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job posting:', error);
      return false;
    }
    return true;
  },

  async publishJob(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('job_postings')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error publishing job:', error);
      return false;
    }
    return true;
  },

  async closeJob(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('job_postings')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error closing job:', error);
      return false;
    }
    return true;
  },

  // Candidates
  async getCandidates(filters?: {
    job_id?: string;
    status?: string;
    search?: string;
  }): Promise<CandidateWithDetails[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('candidates')
      .select(`
        *,
        job:job_postings(*),
        interviewer:employees!interviewer_id(id, first_name, last_name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
    return data || [];
  },

  async getCandidateById(id: string): Promise<CandidateWithDetails | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        job:job_postings(*),
        interviewer:employees!interviewer_id(id, first_name, last_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching candidate:', error);
      return null;
    }
    return data;
  },

  async createCandidate(candidate: CandidateInsert): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .insert(candidate)
      .select()
      .single();

    if (error) {
      console.error('Error creating candidate:', error);
      return null;
    }
    return data;
  },

  async updateCandidate(id: string, updates: CandidateUpdate): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating candidate:', error);
      return null;
    }
    return data;
  },

  async advanceCandidate(id: string, newStatus: string): Promise<boolean> {
    const { error } = await supabase
      .from('candidates')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error advancing candidate:', error);
      return false;
    }
    return true;
  },

  async rejectCandidate(id: string, reason?: string): Promise<boolean> {
    const { error } = await supabase
      .from('candidates')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error rejecting candidate:', error);
      return false;
    }
    return true;
  },

  async hireCandidate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('candidates')
      .update({
        status: 'hired',
        hired_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error hiring candidate:', error);
      return false;
    }
    return true;
  },

  // Candidate Notes
  async getCandidateNotes(candidateId: string): Promise<CandidateNote[]> {
    const { data, error } = await supabase
      .from('candidate_notes')
      .select('*, author:profiles(*)')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching candidate notes:', error);
      return [];
    }
    return data || [];
  },

  async addCandidateNote(note: CandidateNoteInsert): Promise<CandidateNote | null> {
    const { data, error } = await supabase
      .from('candidate_notes')
      .insert(note)
      .select()
      .single();

    if (error) {
      console.error('Error adding candidate note:', error);
      return null;
    }
    return data;
  },

  // Stats
  async getStats(): Promise<{
    openPositions: number;
    totalApplicants: number;
    interviewsScheduled: number;
    offersExtended: number;
    hired: number;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { openPositions: 0, totalApplicants: 0, interviewsScheduled: 0, offersExtended: 0, hired: 0 };

    const { count: openPositions } = await supabase
      .from('job_postings')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'published');

    const { count: totalApplicants } = await supabase
      .from('candidates')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const { count: interviewsScheduled } = await supabase
      .from('candidates')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'interview');

    const { count: offersExtended } = await supabase
      .from('candidates')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'offer');

    const { count: hired } = await supabase
      .from('candidates')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'hired');

    return {
      openPositions: openPositions || 0,
      totalApplicants: totalApplicants || 0,
      interviewsScheduled: interviewsScheduled || 0,
      offersExtended: offersExtended || 0,
      hired: hired || 0
    };
  },

  async getPipelineStats(jobId?: string): Promise<{
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
  }> {
    const orgId = await getOrganizationId();
    if (!orgId) return { applied: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0 };

    let query = supabase
      .from('candidates')
      .select('status')
      .eq('organization_id', orgId);

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: candidates } = await query;

    if (!candidates) {
      return { applied: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0 };
    }

    return {
      applied: candidates.filter(c => c.status === 'applied').length,
      screening: candidates.filter(c => c.status === 'screening').length,
      interview: candidates.filter(c => c.status === 'interview').length,
      offer: candidates.filter(c => c.status === 'offer').length,
      hired: candidates.filter(c => c.status === 'hired').length,
      rejected: candidates.filter(c => c.status === 'rejected').length
    };
  }
};
