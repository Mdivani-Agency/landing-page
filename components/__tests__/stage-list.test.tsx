import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StageList, StageListItem } from "@/components/stage-list";

describe("StageList", () => {
  it("renders an ordered list with custom classes", () => {
    render(
      <StageList className="md:grid-cols-2">
        <StageListItem index={0} title="Understand" body="First step" />
      </StageList>,
    );

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveClass("grid", "md:grid-cols-2");
  });
});

describe("StageListItem", () => {
  it("renders a padded ordinal from the zero-based index", () => {
    render(
      <StageList>
        <StageListItem index={0} title="Understand" body="First step" />
        <StageListItem index={9} title="Launch" body="Last step" />
      </StageList>,
    );

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders title and body for process steps", () => {
    render(
      <StageList>
        <StageListItem index={0} title="Understand" body="What you are building" />
      </StageList>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Understand" }),
    ).toBeInTheDocument();
    expect(screen.getByText("What you are building")).toBeInTheDocument();
  });

  it("renders children when no title is given", () => {
    render(
      <StageList>
        <StageListItem index={2}>
          <p>Custom stage content</p>
        </StageListItem>
      </StageList>,
    );

    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("Custom stage content")).toBeInTheDocument();
  });
});
