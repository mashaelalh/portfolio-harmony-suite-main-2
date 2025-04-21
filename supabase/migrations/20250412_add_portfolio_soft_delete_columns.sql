-- Add soft delete columns to portfolios table
ALTER TABLE portfolios
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deleted_by UUID,
ADD COLUMN restoration_expires_at TIMESTAMPTZ,
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for soft delete queries
CREATE INDEX idx_portfolios_is_deleted ON portfolios(is_deleted);

-- Update audit_logs table to track portfolio soft deletes
ALTER TABLE audit_logs
ADD COLUMN portfolio_id UUID REFERENCES portfolios(id);