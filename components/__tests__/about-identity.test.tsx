import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutIdentity } from "@/components/about-identity";

describe("AboutIdentity", () => {
  it("shows the portrait and caption without any overlaid badge", () => {
    render(<AboutIdentity />);

    expect(screen.getByRole("figure")).toContainElement(
      screen.getByRole("img", { name: "Giorgi Mdivani" }),
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
