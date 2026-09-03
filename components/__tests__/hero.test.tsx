import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/sections/hero";
import { selectedWork } from "@/lib/content";

describe("Hero", () => {
  it("fills the second column with the portrait instead of more copy", () => {
    render(<Hero />);

    expect(screen.getByRole("figure")).toContainElement(
      screen.getByRole("img", { name: "Giorgi Mdivani" }),
    );
  });

  it("names the production work above the fold", () => {
    render(<Hero />);

    const names = selectedWork.map((item) => item.name).join(" · ");
    expect(screen.getByText(`In production: ${names}`)).toBeInTheDocument();
  });
});
