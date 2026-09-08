-- Contact inquiries from POST /api/contact.
--
-- Valid submissions are stored here first, then emailed through Resend.
-- There is no public read or write path. The API inserts with the service
-- role (bypasses RLS). Editors view rows in the Table Editor.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  project_type text not null,
  budget text,
  timeline text not null,
  description text not null,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

create index if not exists inquiries_email_idx
  on public.inquiries (email);

comment on table public.inquiries is
  'Project inquiries from /inquiry. Written only by POST /api/contact using the service role. Not publicly readable.';

alter table public.inquiries enable row level security;

-- Default grants on public tables can still expose the relation through the
-- Data API. Revoke those; do not add anon/authenticated policies.
revoke all on table public.inquiries from anon, authenticated, public;

grant select, insert on public.inquiries to service_role;
