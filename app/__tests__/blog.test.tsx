import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFakeSupabase,
  fakeBlogRows,
  type FakeSupabase,
} from "@/test-utils/supabase-mock";

const state = vi.hoisted(() => ({
  client: undefined as unknown as FakeSupabase,
}));

vi.mock("@/lib/supabase", async () => {
  const { supabaseModuleMock } = await import("@/test-utils/supabase-mock");
  return supabaseModuleMock(() => state.client);
});

import BlogLayout from "@/app/blog/layout";
import BlogPage from "@/app/blog/page";
import BlogPostPage from "@/app/blog/[slug]/page";

beforeEach(() => {
  state.client = createFakeSupabase(fakeBlogRows);
});

describe("/blog", () => {
  it("opts blog cards into an opaque reading surface", async () => {
    const page = await BlogPage();
    const { container } = render(<BlogLayout>{page}</BlogLayout>);

    expect(container.firstElementChild).toHaveClass(
      "blog-reading",
      "[--card-bg:rgba(8,9,11,0.82)]",
    );
    expect(
      screen.getByRole("link", {
        name: "From idea to a production AI product",
      }),
    ).toHaveAttribute("href", "/blog/idea-to-production-ai");
  });
});

describe("/blog/[slug]", () => {
  it("keeps the dek muted and constrains the article to an essay measure", async () => {
    const page = await BlogPostPage({
      params: Promise.resolve({ slug: "idea-to-production-ai" }),
    });
    render(page);

    const measure = document.querySelector(".article-measure");
    expect(measure).toHaveClass("max-w-[68ch]", "text-md");

    const dek = screen.getByText("Enough description for the card.");
    expect(dek).toHaveClass("text-muted");
    expect(dek).not.toHaveClass("text-primary");
    expect(dek.closest(".article-measure")).toBe(measure);

    const articleBody = document.querySelector(".article-body");
    expect(articleBody).toHaveClass("text-primary");
    expect(articleBody?.closest(".article-measure")).toBe(measure);
  });

  it("places a dark wash under the article column on large screens", async () => {
    const page = await BlogPostPage({
      params: Promise.resolve({ slug: "idea-to-production-ai" }),
    });
    const { container } = render(page);

    const wash = container.querySelector(".article-wash");
    expect(wash).toHaveClass(
      "bg-[rgba(8,9,11,0.72)]",
      "hidden",
      "lg:block",
    );
  });

  it("exposes LinkedIn, X, and Reddit share links near the title", async () => {
    const page = await BlogPostPage({
      params: Promise.resolve({ slug: "idea-to-production-ai" }),
    });
    render(page);

    const share = screen.getByRole("navigation", { name: "Share this post" });
    expect(share).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Share on LinkedIn" })).toHaveAttribute(
      "href",
      expect.stringContaining("linkedin.com/sharing/share-offsite"),
    );
    expect(screen.getByRole("link", { name: "Share on X" })).toHaveAttribute(
      "href",
      expect.stringContaining("twitter.com/intent/tweet"),
    );
    expect(screen.getByRole("link", { name: "Share on Reddit" })).toHaveAttribute(
      "href",
      expect.stringContaining("reddit.com/submit"),
    );
  });
});
