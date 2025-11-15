import { supabase } from "@/integrations/supabase/client";

interface AuditLogParams {
  action_type: 'create' | 'update' | 'delete' | 'role_change';
  resource_type: 'celebrity' | 'user_role';
  resource_id?: string;
  resource_name?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}

/**
 * Log an admin action to the audit logs for compliance and security monitoring
 * This function is fire-and-forget and will not throw errors
 */
export const logAdminAction = async (params: AuditLogParams): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('Cannot log admin action: No authenticated user');
      return;
    }

    const { error } = await supabase.from('admin_audit_logs').insert({
      admin_user_id: user.id,
      action_type: params.action_type,
      resource_type: params.resource_type,
      resource_id: params.resource_id,
      resource_name: params.resource_name,
      changes: params.changes,
      user_agent: navigator.userAgent
    });

    if (error) {
      console.error('Failed to log admin action:', error);
    }
  } catch (error) {
    // Log to console but don't throw - logging failures shouldn't break the app
    console.error('Failed to log admin action:', error);
  }
};
