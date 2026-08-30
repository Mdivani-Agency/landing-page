import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/components/avatar";

describe("Avatar", () => {
  it("renders the image when a src is provided", () => {
    render(
      <Avatar
        src="/assets/images/giorgi.jpg"
        alt="Giorgi Mdivani"
        fallback="Giorgi Mdivani"
      />,
    );

    expect(screen.getByRole("img", { name: "Giorgi Mdivani" })).toBeInTheDocument();
    expect(screen.queryByText("GM")).not.toBeInTheDocument();
  });

  it("renders initials when there is no src", () => {
    render(<Avatar alt="Giorgi Mdivani" fallback="Giorgi Mdivani" />);

    const fallback = screen.getByRole("img", { name: "Giorgi Mdivani" });
    expect(fallback).toHaveAttribute("aria-label", "Giorgi Mdivani");
    expect(screen.getByText("GM")).toBeInTheDocument();
  });

  it("keeps short fallbacks without spaces as-is, uppercased", () => {
    render(<Avatar alt="AI avatar" fallback="ai" />);

    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  it("falls back to initials when the image fails to load", () => {
    render(
      <Avatar
        src="/assets/images/missing.jpg"
        alt="Giorgi Mdivani"
        fallback="Giorgi Mdivani"
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Giorgi Mdivani" }));

    expect(screen.getByText("GM")).toBeInTheDocument();
    expect(document.querySelector("img")).not.toBeInTheDocument();
  });
});
