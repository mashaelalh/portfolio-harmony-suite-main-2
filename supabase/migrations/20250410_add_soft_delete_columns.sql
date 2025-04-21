-- Add soft delete columns to projects table
ALTER TABLE projects 
ADD COLUMN is_deleted BOOLEAN DEFAULT false,
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deleted_by UUID,
ADD COLUMN restoration_eligible_until TIMESTAMP WITH TIME ZONE;

-- Create an index for efficient soft delete queries
CREATE INDEX idx_projects_soft_delete ON projects (is_deleted);

-- Create audit logs table for tracking deletion events
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for efficient audit log queries
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);