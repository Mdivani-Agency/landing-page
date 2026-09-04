-- Editors can pin one or more posts on /blog. Draft + featured is allowed
-- here; public reads still require status = published. There is no cap —
-- featuring is an editorial choice, not a constraint.

alter table public.blog_posts
  add column if not exists featured boolean not null default false;

-- Listing query for the featured block: published featured posts, newest first.
create index if not exists blog_posts_featured_published_at_idx
  on public.blog_posts (published_at desc)
  where status = 'published' and featured = true;

comment on column public.blog_posts.featured is
  'When true, a published post appears in the featured block above the chronological /blog grid. Toggle in the table editor or send featured on POST /api/posts. No cap is enforced.';
