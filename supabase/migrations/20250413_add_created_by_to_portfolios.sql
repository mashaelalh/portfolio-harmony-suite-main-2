-- Add created_by column to portfolios table
ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add comment explaining the column
COMMENT ON COLUMN portfolios.created_by IS 'User ID of who created the portfolio';

-- Create index for efficient queries by creator
CREATE INDEX IF NOT EXISTS idx_portfolios_created_by ON portfolios(created_by);