import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogMarkdown, BlogTags } from "@/components/blog-markdown";
import { BlogPostCard } from "@/components/blog-post-card";
import type { BlogPost } from "@/lib/blog";

const post: BlogPost = {
  slug: "idea-to-production-ai",
  title: "From idea to a production AI product",
  description: "How the first slice gets to production.",
  content: "## Start with a job\n\nThe model is not the product.",
  coverImageUrl: null,
  tags: ["AI", "product"],
  status: "published",
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
  });
});

describe("BlogMarkdown", () => {
  it("renders markdown headings and links with existing tokens", () => {
    render(
      <BlogMarkdown>{post.content + "\n\nSee [startup](/startup-development)."}</BlogMarkdown>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Start with a job" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "startup" })).toHaveAttribute(
      "href",
      "/startup-development",
    );
  });
});

describe("BlogTags", () => {
  it("renders nothing when there are no tags", () => {
    const { container } = render(<BlogTags tags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
