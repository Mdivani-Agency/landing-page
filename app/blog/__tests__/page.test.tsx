import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFakeSupabase,
  fakeBlogRow,
  fakeBlogRows,
  type FakeSupabase,
} from "@/test-utils/supabase-mock";

const state = vi.hoisted(() => ({
  client: undefined as unknown as FakeSupabase,
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  permanentRedirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/supabase", async () => {
  const { supabaseModuleMock } = await import("@/test-utils/supabase-mock");
  return supabaseModuleMock(() => state.client);
});

vi.mock("next/navigation", () => ({
  notFound: () => state.notFound(),
  permanentRedirect: (url: string) => state.permanentRedirect(url),
}));

import BlogPage from "@/app/blog/page";
import BlogListPage, {
  generateMetadata as generateBlogListPageMetadata,
  generateStaticParams as generateBlogListStaticParams,
} from "@/app/blog/page/[page]/page";

function extraPublishedRows(count: number) {
  return Array.from({ length: count }, (_, index) =>
    fakeBlogRow({
      slug: `extra-${index + 1}`,
      title: `Extra post ${index + 1}`,
      published_at: `2026-07-${String(index + 1).padStart(2, "0")}T09:00:00.000Z`,
    }),
  );
}

beforeEach(() => {
  state.client = createFakeSupabase(fakeBlogRows);
  state.notFound.mockClear();
  state.permanentRedirect.mockClear();
});

describe("/blog", () => {
  it("puts featured posts above the chronological grid with distinct treatment", async () => {
    render(await BlogPage());

    expect(
      screen.getByRole("heading", { level: 2, name: "Featured posts" }),
    ).toBeInTheDocument();

    const featuredLink = screen.getByRole("link", {
      name: "From idea to a production AI product",
    });
    const restLink = screen.getByRole("link", {
      name: "Shipping the first slice",
    });

    expect(
      featuredLink.compareDocumentPosition(restLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const featuredCard = featuredLink.closest("article");
    expect(featuredCard).toHaveClass("border-[rgba(159,212,200,0.35)]");
    expect(featuredCard).toHaveTextContent("Featured");

    const restCard = restLink.closest("article");
    expect(restCard).toHaveClass("border-subtle");
    expect(restCard).not.toHaveTextContent("Featured");
  });

  it("hides pagination when the chronological grid fits on one page", async () => {
    render(await BlogPage());

    expect(
      screen.queryByRole("navigation", { name: "Blog pagination" }),
    ).not.toBeInTheDocument();
  });

  it("shows one page of regular posts plus pagination when the catalog overflows", async () => {
    state.client = createFakeSupabase([
      ...fakeBlogRows,
      ...extraPublishedRows(6),
    ]);

    render(await BlogPage());

    expect(
      screen.getByRole("link", { name: "Shipping the first slice" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Extra post 6" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Extra post 1" })).not.toBeInTheDocument();

    const pagination = screen.getByRole("navigation", { name: "Blog pagination" });
    expect(pagination).toBeInTheDocument();
    expect(screen.getByText("Previous")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/blog/page/2",
    );
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "href",
      "/blog/page/2",
    );
  });

  it("shows the empty state when nothing is published", async () => {
    state.client = createFakeSupabase([]);

    render(await BlogPage());

    expect(screen.getByText("No posts published yet.")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Featured posts" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Blog pagination" }),
    ).not.toBeInTheDocument();
  });
});

describe("/blog/page/[page]", () => {
  it("loads the next slice without repeating featured posts", async () => {
    state.client = createFakeSupabase([
      ...fakeBlogRows,
      ...extraPublishedRows(6),
    ]);

    render(
      await BlogListPage({ params: Promise.resolve({ page: "2" }) }),
    );

    expect(
      screen.queryByRole("heading", { name: "Featured posts" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: "From idea to a production AI product",
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Extra post 1" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Shipping the first slice" }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/blog",
    );
    expect(screen.getByText("Next")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("2")).toHaveAttribute("aria-current", "page");
  });

  it("redirects /blog/page/1 to the canonical listing", async () => {
    await expect(
      BlogListPage({ params: Promise.resolve({ page: "1" }) }),
    ).rejects.toThrow("NEXT_REDIRECT:/blog");
    expect(state.permanentRedirect).toHaveBeenCalledWith("/blog");
  });

  it("404s unknown or empty extra pages", async () => {
    await expect(
      BlogListPage({ params: Promise.resolve({ page: "abc" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    await expect(
      BlogListPage({ params: Promise.resolve({ page: "2" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("builds static params and page metadata for later pages", async () => {
    state.client = createFakeSupabase([
      ...fakeBlogRows,
      ...extraPublishedRows(6),
    ]);

    await expect(generateBlogListStaticParams()).resolves.toEqual([{ page: "2" }]);

    const metadata = await generateBlogListPageMetadata({
      params: Promise.resolve({ page: "2" }),
    });

    expect(metadata.title).toBe("Blog — Page 2");
    expect(metadata.alternates).toEqual(
      expect.objectContaining({ canonical: "/blog/page/2" }),
    );
  });
});
