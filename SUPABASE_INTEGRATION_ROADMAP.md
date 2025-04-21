# Supabase Integration Improvement Roadmap

This document outlines the plan to address findings from the Supabase integration audit and implement recommended improvements.

## Phase 1: Security Enhancement (High Priority)

*   **Goal:** Secure Supabase credentials.
*   **Task:** Move Supabase URL and Anon Key to Environment Variables.
    *   **Action:**
        1.  Create a `.env.local` file in the project root (ensure it's in `.gitignore`).
        2.  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`.
        3.  Modify `src/integrations/supabase/client.ts` to read these variables from `import.meta.env`.

## Phase 2: Backend Verification & Refinement

*   **Goal:** Ensure backend setup matches application logic and refine demo flow.
*   **Task 1:** Verify `users` Table Schema and Triggers.
    *   **Action:** Check Supabase dashboard (Table Editor, Triggers) for the `users` table schema and associated triggers. Ensure they align with `authStore.ts` expectations.
*   **Task 2:** Review Demo User Auto-Creation Logic.
    *   **Action:** Analyze the `login` function in `src/lib/store/authStore.ts`. Decide whether to keep, modify, or remove the automatic demo account creation logic. Plan alternative seeding if needed.

## Phase 3: Feature Implementation (If Required)

*   **Goal:** Add standard user registration capability.
*   **Task:** Implement Standard User Signup Flow.
    *   **Action:**
        1.  Create a new route and page component (e.g., `/signup`, `src/pages/Signup.tsx`).
        2.  Build a signup form.
        3.  Add a `signup` function to `src/lib/store/authStore.ts` using `supabase.auth.signUp`.
        4.  Ensure the process correctly populates the custom `users` table.

## Phase 4: Code Optimization (Lower Priority)

*   **Goal:** Refine client-side auth handling.
*   **Task:** Streamline `onAuthStateChange` Usage.
    *   **Action:** Review `onAuthStateChange` listeners in `LoginForm.tsx` and `AuthGuard.tsx`. Test removing the potentially redundant listener in `LoginForm.tsx`.

## Roadmap Visualization

```mermaid
graph TD
    subgraph Phase 1 [Security Enhancement]
        A[Move Keys to .env] --> B(Update client.ts)
    end
    subgraph Phase 2 [Backend Verification & Refinement]
        C[Verify 'users' Table] --> D(Verify Triggers)
        E[Review Demo Logic] --> F{Decide on Demo Flow}
    end
    subgraph Phase 3 [Feature Implementation]
        G{Need Signup?} -- Yes --> H(Create Signup Page)
        H --> I(Add signup func to store)
        I --> J(Ensure profile creation)
    end
    subgraph Phase 4 [Optimization]
        K[Review onAuthStateChange] --> L(Test removing redundant listener)
    end

    B --> C
    B --> E
    F --> G
    J --> K
    D --> E