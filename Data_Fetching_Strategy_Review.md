# Data Fetching Strategy Review

---

## Findings

- **React Query is installed** but **not used** in the codebase.
- **All async data fetching** is handled inside **Zustand stores** with direct Supabase calls.
- Zustand manages:
  - Fetching data on mount or demand.
  - Storing data in global state.
  - Basic loading/error handling.
- **No caching, background updates, or deduplication** features of React Query are utilized.

---

## Analysis

| Aspect                     | Zustand Async Fetching                     | React Query                                         |
|----------------------------|--------------------------------------------|-----------------------------------------------------|
| **Caching**                | Manual, if at all                         | Built-in, automatic                                 |
| **Background Refetching**  | Manual                                    | Automatic, configurable                             |
| **Request Deduplication**  | Manual                                    | Automatic                                           |
| **Error Handling**         | Manual                                    | Built-in, with retries                              |
| **Devtools**               | None                                      | Excellent devtools                                  |
| **Complexity**             | Simple for small apps                     | Slightly more setup, but scalable                   |
| **Learning Curve**         | Low                                       | Moderate                                            |
| **Integration**            | Already used for state                    | Can be combined with Zustand for local state        |

---

## Recommendations

- **Consolidate data fetching strategy** to avoid inconsistency.
- **Preferred approach:** 
  - Use **React Query** for **all async data fetching**.
  - Use **Zustand** for **local UI state and derived state only**.
- **Migration plan:**
  1. Add React Query Provider at app root.
  2. Refactor one feature (e.g., projects) to use `useQuery`.
  3. Gradually migrate other data fetching.
  4. Remove async logic from Zustand stores.
- **Document** the chosen approach clearly.

---

## Summary

Migrating to React Query for data fetching will improve caching, consistency, and developer experience, while Zustand remains for local state management.