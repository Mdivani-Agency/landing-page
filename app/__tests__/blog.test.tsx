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
    expect(measure).toHaveClass(
      "mx-auto",
      "w-full",
      "max-w-[68ch]",
      "lg:max-w-[72ch]",
      "text-md",
    );

    const dek = screen.getByText("Enough description for the card.");
    expect(dek).toHaveClass("text-muted");
    expect(dek).not.toHaveClass("text-primary");
    expect(dek.closest(".article-measure")).toBeNull();

    const articleBody = document.querySelector(".article-body");
    expect(articleBody).toHaveClass("w-full", "text-primary");
    expect(articleBody?.closest(".article-measure")).toBe(measure);
  });

  it("places a full-width dark reading surface behind the article column", async () => {
    const page = await BlogPostPage({
      params: Promise.resolve({ slug: "idea-to-production-ai" }),
    });
    const { container } = render(page);

    const wash = container.querySelector(".article-wash");
    expect(wash).toHaveClass(
      "inset-0",
      "bg-[rgba(8,9,11,0.72)]",
    );
    expect(wash?.parentElement).toHaveClass("article-reading-surface");
  });

  it("wraps Blog in breadcrumbs that match the JSON-LD trail", async () => {
    const page = await BlogPostPage({
      params: Promise.resolve({ slug: "idea-to-production-ai" }),
    });
    render(page);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
    expect(
      screen.getByText("From idea to a production AI product", {
        selector: "[aria-current=page]",
      }),
    ).toBeInTheDocument();
  });

  it("places tags and responsive sharing controls after the article", async () => {
    const page = await BlogPostPage({
      params: Promise.resolve({ slug: "idea-to-production-ai" }),
    });
    render(page);

    const share = screen.getByRole("navigation", { name: "Share this post" });
    const footer = share.closest(".article-footer");

    expect(footer).toHaveClass("mt-3", "lg:mt-5");
    expect(footer?.previousElementSibling).toHaveClass(
      "article-reading-surface",
    );
    expect(footer).toContainElement(screen.getByText("AI"));
    expect(share).toHaveClass("mt-2", "lg:mt-4");
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
