# Document Upload Feature Design

## 1. `documents` Table Schema

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  uploaded_at timestamp with time zone default timezone('utc', now()),
  uploaded_by uuid references users(id) on delete set null,
  description text
);
```

---

## 2. Recommended RLS Policies

```sql
alter table documents enable row level security;

create policy "Allow project members to view documents" on documents
for select
using (
  exists (
    select 1 from resources
    where resources.project_id = documents.project_id
      and resources.user_id = auth.uid()
  )
);

create policy "Allow admins and PMs to modify documents" on documents
for all
using (
  exists (
    select 1 from users
    where users.id = auth.uid()
      and users.role in ('admin', 'pm')
  )
);
```

---

## 3. Supabase Storage Bucket

- **Name:** `project-documents`
- **Public:** Yes (or configure signed URLs)
- **Create via:** Supabase Dashboard > Storage > Create bucket

---

## 4. Frontend Upload Flow

1. User clicks **Upload Document**.
2. Selects a file.
3. Upload file to Storage bucket under `project-{projectId}/{fileName}`.
4. Get public URL.
5. Insert metadata into `documents` table.
6. Refresh documents list in UI.

---

## Diagram

```mermaid
flowchart TD
  subgraph Frontend
    A[User clicks "Upload Document"]
    B[File picker opens]
    C[File selected]
    D[Upload file to Supabase Storage bucket]
    E[Get public URL]
    F[Insert metadata into documents table]
    G[Refresh documents list]
  end

  subgraph Supabase
    H[Storage bucket: project-documents]
    I[Table: documents]
  end

  A --> B --> C --> D --> E --> F --> G
  D --> H
  F --> I