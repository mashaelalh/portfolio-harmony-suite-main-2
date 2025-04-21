import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  static async log(entry: AuditLogEntry) {
    try {
      // Use type assertion and any to bypass type checking
      const { error } = await (supabase as any)
        .from('audit_logs')
        .insert({
          action: entry.action,
          entity_type: entry.entityType,
          entity_id: entry.entityId,
          user_id: entry.userId,
          metadata: JSON.stringify(entry.metadata || {})
        });

      if (error) {
        console.error('Audit log error:', error);
      }
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  static async getProjectAuditLogs(projectId: string) {
    try {
      // Use type assertion and any to bypass type checking
      const { data, error } = await (supabase as any)
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'project')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }
}

// Export a function to create audit log entries easily
export const createAuditLog = (
  action: string, 
  entityType: string, 
  entityId: string, 
  userId?: string, 
  metadata?: Record<string, any>
) => {
  return AuditLogger.log({
    action,
    entityType,
    entityId,
    userId,
    metadata
  });
};