import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogPagination } from "@/components/blog-pagination";
import { site } from "@/lib/site";

describe("BlogPagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(<BlogPagination page={1} pageCount={1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(<BlogPagination page={1} pageCount={3} />);

    expect(screen.getByText("Previous")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/blog/page/2",
    );
    expect(document.querySelector('link[rel="next"]')).toHaveAttribute(
      "href",
      `${site.url}/blog/page/2`,
    );
    expect(document.querySelector('link[rel="prev"]')).toBeNull();

    rerender(<BlogPagination page={3} pageCount={3} />);

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/blog/page/2",
    );
    expect(screen.getByText("Next")).toHaveAttribute("aria-disabled", "true");
    expect(document.querySelector('link[rel="prev"]')).toHaveAttribute(
      "href",
      `${site.url}/blog/page/2`,
    );
    expect(document.querySelector('link[rel="next"]')).toBeNull();
  });
});
