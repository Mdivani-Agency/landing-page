import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Card, CardText, CardTitle } from "@/components/card";

describe("Card", () => {
  it("renders an article with the card shell classes by default", () => {
    render(<Card data-testid="card">Content</Card>);

    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("ARTICLE");
    expect(card).toHaveClass("rounded-card", "border", "bg-card", "p-3", "border-subtle");
    expect(card).toHaveTextContent("Content");
  });

  it("renders a custom element and forwards a ref via the as prop", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card as="div" ref={ref} data-testid="card">
        Content
      </Card>,
    );

    expect(screen.getByTestId("card").tagName).toBe("DIV");
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("uses the featured border for the featured variant", () => {
    render(<Card variant="featured" data-testid="card" />);

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("border-[rgba(159,212,200,0.35)]");
    expect(card).not.toHaveClass("border-subtle");
  });

  it("appends a custom className to the shell classes", () => {
    render(<Card className="extra" data-testid="card" />);

    expect(screen.getByTestId("card")).toHaveClass("rounded-card", "extra");
  });

  it("forwards arbitrary props such as aria-labelledby", () => {
    render(<Card aria-labelledby="card-heading" data-testid="card" />);

    expect(screen.getByTestId("card")).toHaveAttribute(
      "aria-labelledby",
      "card-heading",
    );
  });
});

describe("CardTitle", () => {
  it("renders a level three heading", () => {
    render(<CardTitle>Card heading</CardTitle>);

    expect(
      screen.getByRole("heading", { level: 3, name: "Card heading" }),
    ).toBeInTheDocument();
  });
});

describe("CardText", () => {
  it("renders muted paragraph text", () => {
    render(<CardText>Body copy</CardText>);

    const text = screen.getByText("Body copy");
    expect(text.tagName).toBe("P");
    expect(text).toHaveClass("text-muted");
  });
});
