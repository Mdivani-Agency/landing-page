import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextLink } from "@/components/text-link";

describe("TextLink", () => {
  it("renders an underlined link with the given href", () => {
    render(<TextLink href="/work">See the work</TextLink>);

    const link = screen.getByRole("link", { name: "See the work" });
    expect(link).toHaveAttribute("href", "/work");
    expect(link).toHaveClass("underline", "text-secondary");
  });

  it("merges custom classes and forwards link props", () => {
    render(
      <TextLink href="/about" className="extra" title="About Giorgi">
        About
      </TextLink>,
    );

    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveClass("underline", "extra");
    expect(link).toHaveAttribute("title", "About Giorgi");
  });
});
