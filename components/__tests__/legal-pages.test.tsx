import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy";
import { TermsOfServiceContent } from "@/components/legal/terms-of-service";
import { metadata as privacyMetadata } from "@/app/privacy-policy/page";
import { metadata as termsMetadata } from "@/app/terms-of-service/page";
import { site } from "@/lib/site";

describe("legal pages", () => {
  it("titles privacy policy without Mdio and matches live tracking", () => {
    const { container } = render(<PrivacyPolicyContent />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy Policy" }),
    ).toBeInTheDocument();
    expect(container.textContent).toContain("Last updated: 1 September 2026");
    expect(container.textContent).toContain("G-GRS8QP3EG6");
    expect(container.textContent).toContain("Vercel Web Analytics");
    expect(container.textContent).toContain("Sentry");
    expect(container.textContent).toContain("Resend");
    expect(container.textContent).toContain("/api/contact");
    expect(container.textContent).not.toMatch(/Privacy Policy for Mdio/i);

    const emailLinks = screen.getAllByRole("link", { name: site.email });
    expect(emailLinks.length).toBeGreaterThan(0);
    for (const link of emailLinks) {
      expect(link).toHaveAttribute("href", `mailto:${site.email}`);
    }
    expect(
      screen.getByRole("link", { name: "Google’s opt-out browser add-on" }),
    ).toHaveAttribute("href", "https://tools.google.com/dlpage/gaoptout");

    const tables = container.querySelectorAll("table");
    expect(tables).toHaveLength(2);
    for (const table of tables) {
      expect(table.parentElement).toHaveClass("overflow-x-auto");
    }

    const cookieTable = tables[1];
    expect(within(cookieTable).getByText("Essential?")).toBeInTheDocument();
  });

  it("titles terms of service without Mdio and points at the privacy policy", () => {
    const { container } = render(<TermsOfServiceContent />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Terms of Service" }),
    ).toBeInTheDocument();
    expect(container.textContent).toContain("Last updated: 1 September 2026");
    expect(container.textContent).toContain("Service Agreement");
    expect(container.textContent).toContain("EUR 100");
    expect(container.textContent).not.toMatch(/Terms of Service for Mdio/i);

    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy-policy");
  });

  it("keeps Mdio out of page titles and meta descriptions", () => {
    expect(privacyMetadata.title).toBe("Privacy Policy");
    expect(String(privacyMetadata.description)).not.toMatch(/Mdio/i);

    expect(termsMetadata.title).toBe("Terms of Service");
    expect(String(termsMetadata.description)).not.toMatch(/Mdio/i);
  });
});
