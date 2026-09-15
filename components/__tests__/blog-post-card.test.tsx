import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogPostCard } from "@/components/blog-post-card";
import { BlogTags } from "@/components/blog-tags";
import type { BlogPostSummary } from "@/lib/blog";

const post: BlogPostSummary = {
  slug: "idea-to-production-ai",
  title: "From idea to a production AI product",
  description: "How the first slice gets to production.",
  coverImageUrl: null,
  tags: ["AI", "product"],
  sites: ["agency"],
  status: "published",
  featured: false,
  publishedAt: new Date("2026-08-01T09:00:00.000Z"),
  createdAt: new Date("2026-08-01T09:00:00.000Z"),
  updatedAt: new Date("2026-08-01T09:00:00.000Z"),
};

describe("BlogPostCard", () => {
  it("links the title to the post and shows date, description, and tags", () => {
    render(<BlogPostCard post={post} />);

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "From idea to a production AI product",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "From idea to a production AI product" }),
    ).toHaveAttribute("href", "/blog/idea-to-production-ai");
    expect(
      screen.getByText("How the first slice gets to production."),
    ).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByText("product")).toBeInTheDocument();
    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Share this post" }),
    ).not.toBeInTheDocument();
  });

  it("uses the featured card treatment and badge for a featured post", () => {
    const { container } = render(
      <BlogPostCard post={{ ...post, featured: true }} />,
    );

    expect(screen.getByText(/Featured/)).toBeInTheDocument();
    expect(container.querySelector("article")).toHaveClass(
      "border-[rgba(159,212,200,0.35)]",
    );
    expect(
      screen.queryByRole("navigation", { name: "Share this post" }),
    ).not.toBeInTheDocument();
  });
});

describe("BlogTags", () => {
  it("renders nothing when there are no tags", () => {
    const { container } = render(<BlogTags tags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
