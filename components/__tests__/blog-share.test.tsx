import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogShare } from "@/components/blog-share";
import { getBlogShareLinks } from "@/lib/blog-share";

const props = {
  url: "https://mdivani.agency/blog/idea-to-production-ai",
  title: "From idea to a production AI product",
  description: "How the first slice gets to production.",
};

describe("BlogShare", () => {
  it("renders LinkedIn, X, and Reddit anchors with share intent URLs", () => {
    render(<BlogShare {...props} />);

    const nav = screen.getByRole("navigation", { name: "Share this post" });
    expect(nav).toBeInTheDocument();

    for (const link of getBlogShareLinks(props)) {
      const control = screen.getByRole("link", { name: link.label });
      expect(control).toHaveAttribute("href", link.href);
      expect(control).toHaveAttribute("target", "_blank");
      expect(control).toHaveAttribute("rel", "noopener noreferrer");
    }

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
