-- Add initiative_code column to projects table
-- Stores an optional code associated with the project's initiative

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS initiative_code text;

COMMENT ON COLUMN public.projects.initiative_code IS 'Optional code linking the project to a broader initiative.';