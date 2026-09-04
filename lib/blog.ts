export type PostStatus = "draft" | "published";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImageUrl: string | null;
  tags: string[];
  status: PostStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogPostRecord = Omit<
  BlogPost,
  "publishedAt" | "createdAt" | "updatedAt"
> & {
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function toPost(record: BlogPostRecord): BlogPost {
  return {
    ...record,
    publishedAt: record.publishedAt ? new Date(record.publishedAt) : null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  };
}

function isPublished(post: BlogPost): boolean {
  return post.status === "published" && post.publishedAt != null;
}

let store: BlogPostRecord[] | null = null;

async function loadRecords(): Promise<BlogPostRecord[]> {
  if (!store) {
    const { blogSeedPosts } = await import("@/lib/blog-seed");
    store = blogSeedPosts.map((post) => ({
      ...post,
      tags: [...post.tags],
    }));
  }

  return store;
}

export function resetBlogStore(): void {
  store = null;
}

export async function getPostRecordBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const record = (await loadRecords()).find((post) => post.slug === slug);
  return record ? toPost(record) : null;
}

export async function upsertPostRecord(
  record: BlogPostRecord,
): Promise<BlogPost> {
  const records = await loadRecords();
  const index = records.findIndex((post) => post.slug === record.slug);

  if (index === -1) {
    records.push(record);
  } else {
    records[index] = record;
  }

  return toPost(record);
}

export async function listPublishedPosts(): Promise<BlogPost[]> {
  const posts = (await loadRecords()).map(toPost).filter(isPublished);

  return posts.sort((left, right) => {
    const leftTime = left.publishedAt?.getTime() ?? 0;
    const rightTime = right.publishedAt?.getTime() ?? 0;
    return rightTime - leftTime;
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const record = (await loadRecords()).find((post) => post.slug === slug);

  if (!record) {
    return null;
  }

  const post = toPost(record);
  return isPublished(post) ? post : null;
}

export async function listPublishedSlugs(): Promise<string[]> {
  const posts = await listPublishedPosts();
  return posts.map((post) => post.slug);
}

export function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
