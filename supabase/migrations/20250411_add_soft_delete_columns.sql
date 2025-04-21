-- Add soft delete columns to projects table
-- This migration helps resolve missing soft delete columns

-- Add is_deleted column with default false
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Add deleted_at column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_by column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Add restoration_eligible_until column
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS restoration_eligible_until TIMESTAMP WITH TIME ZONE;

-- Create an index for efficient soft delete queries
CREATE INDEX IF NOT EXISTS idx_projects_soft_delete ON projects (is_deleted);

-- Create audit logs table for tracking deletion events
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_id);

-- Optional: Add a comment to explain the soft delete mechanism
COMMENT ON COLUMN projects.is_deleted IS 'Indicates if the project has been soft-deleted';
COMMENT ON COLUMN projects.deleted_at IS 'Timestamp of when the project was soft-deleted';
COMMENT ON COLUMN projects.deleted_by IS 'User ID of who soft-deleted the project';
COMMENT ON COLUMN projects.restoration_eligible_until IS 'Timestamp until which the project can be restored';