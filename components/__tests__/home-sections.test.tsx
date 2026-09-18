import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeSections } from "@/components/sections/home-sections";
import {
  capabilities,
  namedOutcomes,
  selectedWork,
  testimonials,
} from "@/lib/content";
import { auditInquiryHref } from "@/lib/site";

const featuredCases = selectedWork.filter((item) => item.homeOutcome);
const leadQuote = testimonials.find((testimonial) => testimonial.pullQuote);

describe("HomeSections", () => {
  it("leads with senior ownership copy and a shipping CTA", () => {
    render(<HomeSections />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Ship the product. Own the architecture. Skip the staff-aug bench.",
      }),
    ).toBeInTheDocument();

    const primaryCtas = screen.getAllByRole("link", {
      name: "Tell me what you’re shipping",
    });
    expect(primaryCtas.length).toBeGreaterThanOrEqual(2);
    for (const link of primaryCtas) {
      expect(link).toHaveAttribute("href", "/inquiry");
    }
  });

  it("wires both audit CTAs to the inquiry form without a new route", () => {
    render(<HomeSections />);

    const auditLinks = screen.getAllByRole("link", {
      name: "Book a production-readiness audit",
    });

    expect(auditLinks).toHaveLength(2);
    for (const link of auditLinks) {
      expect(link).toHaveAttribute("href", auditInquiryHref);
    }
  });

  it("leads with named outcomes instead of a capability catalog", () => {
    render(<HomeSections />);

    expect(
      screen.getByRole("heading", {
        name: "Three ways founders usually start.",
      }),
    ).toBeInTheDocument();

    for (const outcome of namedOutcomes) {
      expect(
        screen.getByRole("heading", { name: outcome.title }),
      ).toBeInTheDocument();
      expect(screen.getByText(outcome.body)).toBeInTheDocument();
    }

    expect(
      screen.queryByRole("heading", {
        name: /One engagement/,
      }),
    ).not.toBeInTheDocument();

    for (const capability of capabilities) {
      for (const item of capability.items) {
        expect(screen.queryByText(item)).not.toBeInTheDocument();
      }
    }
  });

  it("keeps existing case bodies and the David Espinosa quote", () => {
    render(<HomeSections />);

    for (const item of featuredCases) {
      expect(screen.getByText(item.homeOutcome as string)).toBeInTheDocument();
    }

    expect(leadQuote?.pullQuote).toBeTruthy();
    expect(screen.getByText(leadQuote?.pullQuote as string)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "David Espinosa on LinkedIn" }),
    ).toBeInTheDocument();
  });

  it("keeps the decade experience line and avoids partnership or paid-contract framing", () => {
    const { container } = render(<HomeSections />);
    const copy = container.textContent ?? "";

    expect(copy).toContain("more than a decade");
    expect(copy).not.toMatch(/8\+/);
    expect(copy).not.toMatch(/partnership|equity/i);
    expect(copy).not.toMatch(/paid contract/i);
  });
});
