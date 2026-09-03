-- Blog posts for mdivani.agency.
--
-- Column names mirror the BlogPost shape the app already uses, in snake_case.
-- Reads are public but limited to published posts; every write path goes
-- through the service role, so no write policies are defined here.

create table if not exists public.blog_posts (
  id bigint generated always as identity primary key,
  slug text not null,
  title text not null,
  description text not null,
  -- A Tiptap/ProseMirror document rather than a markdown string, so
  -- formatting survives a round trip through the editor.
  content jsonb not null,
  cover_image_url text,
  tags text[] not null default '{}',
  -- Which sites may show the post. Defaults to the only site that exists
  -- today; talvio is reserved for the second front end.
  sites text[] not null default '{agency}',
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint blog_posts_slug_key unique (slug),
  constraint blog_posts_status_check check (status in ('draft', 'published')),
  -- A published post without a timestamp would be invisible to the read
  -- policy and sort unpredictably, so the two always travel together.
  constraint blog_posts_published_at_check
    check (status <> 'published' or published_at is not null),
  -- Tiptap's getJSON() always returns a doc node, so anything else here is a
  -- malformed write rather than a body worth storing.
  constraint blog_posts_content_check
    check (jsonb_typeof(content) = 'object' and content ->> 'type' = 'doc'),
  constraint blog_posts_sites_check
    check (sites <@ array['agency', 'talvio']::text[]),
  -- cardinality, not array_length: the latter returns null on an empty array
  -- and a check constraint that evaluates to null passes.
  constraint blog_posts_sites_published_check
    check (status <> 'published' or cardinality(sites) > 0)
);

-- Serves the listing query: published posts, newest first.
create index if not exists blog_posts_published_at_idx
  on public.blog_posts (published_at desc)
  where status = 'published';

create index if not exists blog_posts_tags_idx
  on public.blog_posts using gin (tags);

create index if not exists blog_posts_sites_idx
  on public.blog_posts using gin (sites);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row
  execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Published blog posts are publicly readable"
  on public.blog_posts;

create policy "Published blog posts are publicly readable"
  on public.blog_posts
  for select
  to anon, authenticated
  using (status = 'published' and published_at is not null);

-- RLS decides which rows are visible; these grants decide whether the table is
-- reachable through the Data API at all. Readers get select only.
grant usage on schema public to anon, authenticated;
grant select on public.blog_posts to anon, authenticated;
grant select, insert, update, delete on public.blog_posts to service_role;
