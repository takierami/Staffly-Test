import { supabase } from './supabaseClient';
import type { Database } from './db';
import type { Notification } from './db';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type NotificationInsert = Insert<'notifications'>;
export type NotificationUpdate = Update<'notifications'>;

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

export const notificationService = {
  async getUserNotifications(filters?: {
    is_read?: boolean;
    type?: string;
    limit?: number;
  }): Promise<Notification[]> {
    const orgId = await getOrganizationId();
    if (!orgId) return [];

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', orgId)
      .eq('user_id', (await getCurrentUserId()) || '')
      .order('created_at', { ascending: false });

    if (filters?.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching notification:', error);
      return null;
    }
    return data;
  },

  async create(notification: NotificationInsert): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    return data;
  },

  async createMany(notifications: NotificationInsert[]): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating notifications:', error);
      return 0;
    }
    return data?.length || 0;
  },

  async markAsRead(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    return true;
  },

  async markAllAsRead(): Promise<boolean> {
    const userId = await getCurrentUserId();
    const orgId = await getOrganizationId();
    if (!userId || !orgId) return false;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
    return true;
  },

  async deleteAllRead(): Promise<boolean> {
    const userId = await getCurrentUserId();
    const orgId = await getOrganizationId();
    if (!userId || !orgId) return false;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .eq('is_read', true);

    if (error) {
      console.error('Error deleting read notifications:', error);
      return false;
    }
    return true;
  },

  async getUnreadCount(): Promise<number> {
    const userId = await getCurrentUserId();
    const orgId = await getOrganizationId();
    if (!userId || !orgId) return 0;

    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .eq('is_read', false);

    return count || 0;
  },

  // Subscribe to notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    const orgId = getOrganizationId();
    const userId = getCurrentUserId();

    Promise.all([orgId, userId]).then(([oid, uid]) => {
      if (!oid || !uid) return;

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${uid}`
          },
          (payload) => {
            callback(payload.new as Notification);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  },

  // Helper to create common notification types
  async leaveRequestNotification(userId: string, leaveId: string, type: 'submitted' | 'approved' | 'rejected'): Promise<void> {
    const orgId = await getOrganizationId();
    if (!orgId) return;

    const messages = {
      submitted: 'New leave request submitted',
      approved: 'Your leave request has been approved',
      rejected: 'Your leave request has been rejected'
    };

    await this.create({
      organization_id: orgId,
      user_id: userId,
      type: 'leave_request',
      title: 'Leave Request Update',
      message: messages[type],
      data: { leave_id: leaveId },
      action_url: `/leaves/${leaveId}`
    });
  },

  async performanceReviewNotification(userId: string, reviewId: string, type: 'assigned' | 'completed'): Promise<void> {
    const orgId = await getOrganizationId();
    if (!orgId) return;

    const messages = {
      assigned: 'You have been assigned a performance review',
      completed: 'Your performance review has been completed'
    };

    await this.create({
      organization_id: orgId,
      user_id: userId,
      type: 'performance',
      title: 'Performance Review',
      message: messages[type],
      data: { review_id: reviewId },
      action_url: `/performance/${reviewId}`
    });
  },

  async documentNotification(userId: string, documentId: string, type: 'pending_signature' | 'signed' | 'expired'): Promise<void> {
    const orgId = await getOrganizationId();
    if (!orgId) return;

    const messages = {
      pending_signature: 'A document requires your signature',
      signed: 'Document has been signed successfully',
      expired: 'A document has expired'
    };

    await this.create({
      organization_id: orgId,
      user_id: userId,
      type: 'document',
      title: 'Document Update',
      message: messages[type],
      data: { document_id: documentId },
      action_url: `/documents/${documentId}`
    });
  },

  async trainingNotification(userId: string, trainingId: string, type: 'enrolled' | 'reminder' | 'completed'): Promise<void> {
    const orgId = await getOrganizationId();
    if (!orgId) return;

    const messages = {
      enrolled: 'You have been enrolled in a training program',
      reminder: 'Training program starting soon',
      completed: 'Congratulations! Training completed'
    };

    await this.create({
      organization_id: orgId,
      user_id: userId,
      type: 'training',
      title: 'Training Update',
      message: messages[type],
      data: { training_id: trainingId },
      action_url: `/training/${trainingId}`
    });
  }
};
