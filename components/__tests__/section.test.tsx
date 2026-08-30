import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Eyebrow } from "@/components/eyebrow";
import { Section } from "@/components/section";
import {
  SectionCopy,
  SectionHeader,
  SectionTitle,
} from "@/components/section-header";

describe("Section", () => {
  it("wires up the id and aria-labelledby used by nav anchors", () => {
    render(
      <Section id="build" labelledBy="build-title">
        <h2 id="build-title">What I build</h2>
      </Section>,
    );

    const section = screen.getByRole("region", { name: "What I build" });
    expect(section).toHaveAttribute("id", "build");
    expect(section).toHaveAttribute("aria-labelledby", "build-title");
  });

  it("merges custom classes with the band layout", () => {
    const { container } = render(<Section className="extra">Content</Section>);

    const section = container.querySelector("section");
    expect(section).toHaveClass("flex", "flex-col", "gap-1.5", "extra");
  });
});

describe("SectionHeader", () => {
  it("renders eyebrow, titled heading, and copy", () => {
    render(
      <SectionHeader
        eyebrow="Studio model"
        headingId="studio-title"
        title="A studio, not an agency"
        copy="Band copy"
      />,
    );

    expect(screen.getByText("Studio model")).toBeInTheDocument();

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "A studio, not an agency",
    });
    expect(heading).toHaveAttribute("id", "studio-title");

    expect(screen.getByText("Band copy")).toBeInTheDocument();
  });

  it("omits eyebrow and copy when they are not provided", () => {
    const { container } = render(
      <SectionHeader headingId="title-id" title="Just a title" />,
    );

    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(
      screen.getByRole("heading", { level: 2, name: "Just a title" }),
    ).toBeInTheDocument();
  });
});

describe("SectionTitle", () => {
  it("renders a serif level two heading with the given id", () => {
    render(<SectionTitle id="the-id">Title</SectionTitle>);

    const heading = screen.getByRole("heading", { level: 2, name: "Title" });
    expect(heading).toHaveAttribute("id", "the-id");
    expect(heading).toHaveClass("font-serif");
  });
});

describe("SectionCopy", () => {
  it("renders muted paragraph copy", () => {
    render(<SectionCopy>Copy</SectionCopy>);

    const copy = screen.getByText("Copy");
    expect(copy.tagName).toBe("P");
    expect(copy).toHaveClass("text-muted");
  });
});

describe("Eyebrow", () => {
  it("renders the small secondary style for section eyebrows", () => {
    render(<Eyebrow>Section eyebrow</Eyebrow>);

    const eyebrow = screen.getByText("Section eyebrow");
    expect(eyebrow).toHaveClass("text-xs", "text-secondary");
  });

  it("keeps the intentionally larger muted style for card eyebrows", () => {
    render(<Eyebrow variant="card">Card eyebrow</Eyebrow>);

    const eyebrow = screen.getByText("Card eyebrow");
    expect(eyebrow).toHaveClass("text-sm", "text-muted");
    expect(eyebrow).not.toHaveClass("text-secondary");
  });
});
