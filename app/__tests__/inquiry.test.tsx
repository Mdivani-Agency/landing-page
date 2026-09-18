import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InquiryPage from "@/app/inquiry/page";

describe("/inquiry", () => {
  it("exposes an audit anchor on the existing inquiry form", () => {
    const { container } = render(<InquiryPage />);

    expect(container.querySelector("#audit")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Tell me about your project." }),
    ).toBeInTheDocument();
  });
});
