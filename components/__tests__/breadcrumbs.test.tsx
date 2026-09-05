import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "@/components/breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders ancestor links and marks the last item as the current page", () => {
    render(
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/blog", label: "Blog" },
          { label: "From idea to a production AI product" },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog",
    );
    expect(
      screen.getByText("From idea to a production AI product"),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.queryByRole("link", {
        name: "From idea to a production AI product",
      }),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
