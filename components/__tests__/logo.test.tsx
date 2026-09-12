import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "@/components/logo";

describe("Logo", () => {
  it("links home with the wordmark SVG", () => {
    render(<Logo />);

    const link = screen.getByRole("link", { name: "Mdivani" });
    expect(link).toHaveAttribute("href", "/#home");
    expect(screen.getByRole("img", { name: "Mdivani" })).toHaveAttribute(
      "src",
      "/assets/logo-wordmark.svg",
    );
  });
});
