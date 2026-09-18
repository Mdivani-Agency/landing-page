import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HowIWorkPage from "@/app/how-i-work/page";
import { capabilities, processSteps } from "@/lib/content";

describe("/how-i-work", () => {
  it("does not repeat the homepage services grid", () => {
    render(<HowIWorkPage />);

    for (const capability of capabilities) {
      expect(screen.queryByText(capability.title)).not.toBeInTheDocument();
    }
  });

  it("keeps the process page's own content and closes on a CTA", () => {
    render(<HowIWorkPage />);

    expect(
      screen.getByRole("heading", { name: "Product first, reliability next." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Starting with an idea, not a codebase?",
      }),
    ).toBeInTheDocument();

    for (const step of processSteps) {
      expect(screen.getByText(step.body)).toBeInTheDocument();
    }

    expect(
      screen.getAllByRole("link", { name: /Let’s talk about your product/ }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("link", { name: /Tell me what you’re shipping/ }),
    ).toHaveLength(1);
  });
});
