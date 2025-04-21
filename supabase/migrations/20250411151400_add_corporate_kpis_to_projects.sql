-- Add corporate_kpis column to projects table
-- Stores an array of strings representing linked Corporate KPIs

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS corporate_kpis text[] DEFAULT '{}';

COMMENT ON COLUMN public.projects.corporate_kpis IS 'Array of Corporate KPI identifiers linked to the project.';

-- Optional: Add an index if you plan to query frequently based on KPIs
-- CREATE INDEX IF NOT EXISTS idx_projects_corporate_kpis ON public.projects USING gin (corporate_kpis);