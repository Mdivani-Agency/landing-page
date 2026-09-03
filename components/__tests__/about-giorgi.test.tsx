import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutGiorgi } from "@/components/sections/about-giorgi";
import { site } from "@/lib/site";

const description = "Typical background on a call.";

describe("AboutGiorgi", () => {
  it("keeps the marketplace credit out of the section by default", () => {
    render(<AboutGiorgi title="Work with Giorgi" description={description} />);

    expect(
      screen.queryByRole("link", { name: "Toptal" }),
    ).not.toBeInTheDocument();
  });

  it("renders the marketplace credit as quiet text, not a hire-me CTA", () => {
    render(
      <AboutGiorgi
        title="Giorgi Mdivani"
        description={description}
        showMarketplaceCredit
      />,
    );

    const credit = screen.getByRole("link", { name: "Toptal" });
    expect(credit).toHaveAttribute("href", site.toptalProfileUrl);
    expect(credit.closest("p")).toHaveTextContent(
      "Vetted by Toptal for its top 3% network.",
    );
  });
});
