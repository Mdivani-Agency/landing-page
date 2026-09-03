import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CaseOutcomes } from "@/components/sections/case-outcomes";
import { selectedWork, testimonials } from "@/lib/content";

const featuredCases = selectedWork.filter((item) => item.homeOutcome);

describe("CaseOutcomes", () => {
  it("shows the outcome of every featured case", () => {
    render(<CaseOutcomes />);

    for (const item of featuredCases) {
      expect(screen.getByText(item.homeOutcome as string)).toBeInTheDocument();
    }
  });

  it("links every case to its full write-up on the work page", () => {
    render(<CaseOutcomes />);

    for (const item of featuredCases) {
      expect(
        screen.getByRole("link", { name: `Read the ${item.name} case` }),
      ).toHaveAttribute("href", item.href);
    }
  });

  it("puts one quote under the cases and keeps the older ones off the page", () => {
    render(<CaseOutcomes />);

    expect(
      screen.getByRole("link", { name: "David Espinosa on LinkedIn" }),
    ).toBeInTheDocument();

    const otherAuthors = testimonials
      .filter((testimonial) => !testimonial.pullQuote)
      .map((testimonial) => testimonial.author);

    for (const author of otherAuthors) {
      expect(screen.queryByText(author)).not.toBeInTheDocument();
    }
  });
});
