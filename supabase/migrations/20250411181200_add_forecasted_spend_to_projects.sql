-- Add forecasted_spend column to projects table
-- Stores the estimated future spending for the project

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS forecasted_spend numeric; -- Use numeric for monetary values, allow NULL

COMMENT ON COLUMN public.projects.forecasted_spend IS 'Estimated future spending for the project.';