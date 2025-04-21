-- Add deliverables column to projects table
-- Stores an array of objects representing project deliverables

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS deliverables jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.projects.deliverables IS 'Array of project deliverables, e.g., [{ "name": "Report A", "type": "document" }]';

-- Optional: Add a GIN index if you plan to query inside the jsonb structure frequently
-- CREATE INDEX IF NOT EXISTS idx_projects_deliverables ON public.projects USING gin (deliverables);