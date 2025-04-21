# Plan to Synchronize Frontend, Backend, and Types for `projects` Table

This plan addresses the persistent "Could not find the 'column' column of 'projects' in the schema cache" errors encountered during project creation. The root cause is a mismatch between the Supabase database schema, the frontend form schema (`src/pages/CreateProject.tsx`), and the TypeScript type definitions (`src/integrations/supabase/database.types.ts`).

## Goal

Align the database schema, frontend expectations, and TypeScript types to ensure consistent data handling for the `projects` entity.

## Analysis Summary

-   **Frontend (`projectSchema`) expects:** `projectCode`, `phase`, `projectSponsor`, `projectOwner`, `strategicObjective` (among others).
-   **Backend (`projects` table) is missing:** `project_code`, `phase`, `project_sponsor`, `project_owner`, `strategic_objective`.
-   **Type Definitions (`database.types.ts`) are outdated:** Missing numerous columns currently present in the database (e.g., `corporate_kpis`, `deliverables`, `initiative_code`, `manager_id`, `owning_department`, soft delete columns) and the ones to be added in Step 1.

## Plan Steps

```mermaid
graph TD
    A[1. Update DB Schema (SQL Editor)] --> B(2. Regenerate Types (CLI));
    B --> C(3. Verify Frontend Schema (Code));
    A -- Resolves --> D(Immediate Errors);
    B -- Ensures --> E(Type Safety);
    C -- Ensures --> F(Validation Alignment);
```

### Step 1: Update Database Schema (Using Supabase SQL Editor)

Execute the following SQL commands in your Supabase project's SQL Editor (found under the "Database" section) to add the missing columns to the `public.projects` table.

```sql
-- Add phase column (assuming text is appropriate for the enum values)
ALTER TABLE public.projects
ADD COLUMN phase text;

-- Add project_code column
ALTER TABLE public.projects
ADD COLUMN project_code text;

-- Add project_sponsor column
ALTER TABLE public.projects
ADD COLUMN project_sponsor text;

-- Add project_owner column
ALTER TABLE public.projects
ADD COLUMN project_owner text;

-- Add strategic_objective column (assuming text is appropriate for the enum values)
ALTER TABLE public.projects
ADD COLUMN strategic_objective text;
```

**Verification:** After running the SQL, you can optionally verify the columns were added by inspecting the `projects` table structure in the Supabase dashboard or by running: `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' ORDER BY column_name;`

### Step 2: Update Type Definitions (Using Supabase CLI)

Run the following command in your project's terminal to regenerate the `database.types.ts` file. This ensures your TypeScript code is aware of the *actual* database schema, including the newly added columns and any others that were previously missing.

```bash
# Replace <your-project-id> with your actual Supabase project ID
npx supabase gen types typescript --project-id <your-project-id> --schema public > src/integrations/supabase/database.types.ts
```

**Note:** You need to have the Supabase CLI installed and configured for this command to work.

### Step 3: Verify Frontend Schema (Code Review)

Review the `projectSchema` definition within `src/pages/CreateProject.tsx` (lines ~27-61).

-   Ensure all field names in the schema (`name`, `projectCode`, `phase`, etc.) correctly correspond (camelCase vs. snake\_case) to the columns in the database (`name`, `project_code`, `phase`, etc.).
-   Verify that the Zod types used (`z.string()`, `z.enum([...])`, `z.number()`, `z.date()`, `z.array(...)`, `.optional()`) are appropriate for the corresponding database column types (`text`, `numeric`, `date`, `jsonb`, `ARRAY`, nullable status). Pay special attention to the newly added columns and any enum types.

Make any necessary adjustments to the `projectSchema` to ensure perfect alignment.

## Expected Outcome

After completing these steps:

1.  The "column not found" errors during project creation should be resolved.
2.  Your TypeScript code will have accurate type definitions for the `projects` table, improving type safety and developer experience.
3.  The frontend form validation will correctly reflect the backend data structure.