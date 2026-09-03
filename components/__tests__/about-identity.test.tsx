import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutIdentity } from "@/components/about-identity";

describe("AboutIdentity", () => {
  it("omits the Toptal badge by default", () => {
    render(<AboutIdentity />);

    expect(
      screen.queryByTitle("Hire Giorgi Mdivani on Toptal"),
    ).not.toBeInTheDocument();
  });

  it("renders the Toptal badge only when asked for it", () => {
    render(<AboutIdentity showToptalBadge />);

    expect(
      screen.getByTitle("Hire Giorgi Mdivani on Toptal"),
    ).toBeInTheDocument();
  });
});
