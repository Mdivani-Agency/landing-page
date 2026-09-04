import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/markdown";

describe("Markdown", () => {
  it("renders headings and links with existing tokens", () => {
    render(
      <Markdown>
        {"## Start with a job\n\nSee [startup](/startup-development)."}
      </Markdown>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Start with a job" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "startup" })).toHaveAttribute(
      "href",
      "/startup-development",
    );
  });

  it("renders a body ATX h1 as h2 so the page title stays the only h1", () => {
    render(<Markdown>{"# Intro\n\nBody copy."}</Markdown>);

    expect(
      screen.getByRole("heading", { level: 2, name: "Intro" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });
});

describe("Markdown GFM support", () => {
  it("renders a table inside a horizontally scrollable wrapper", () => {
    const { container } = render(
      <Markdown>
        {"| Stage | Owner |\n| --- | --- |\n| Discovery | Giorgi |"}
      </Markdown>,
    );

    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    expect(screen.getByRole("columnheader", { name: "Stage" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Discovery" })).toBeInTheDocument();

    // A wide table must scroll in its own box rather than widen the page.
    expect(table?.parentElement).toHaveClass("overflow-x-auto");
  });

  it("renders strikethrough and task lists", () => {
    const { container } = render(
      <Markdown>{"~~dropped~~\n\n- [x] shipped\n- [ ] pending"}</Markdown>,
    );

    expect(container.querySelector("del")).toHaveTextContent("dropped");
    expect(container.querySelectorAll("input[type=checkbox]")).toHaveLength(2);
    expect(container.querySelector(".contains-task-list")).not.toBeNull();
  });

  it("autolinks a bare URL", () => {
    render(<Markdown>{"Read https://mdivani.agency for more."}</Markdown>);

    expect(
      screen.getByRole("link", { name: "https://mdivani.agency" }),
    ).toHaveAttribute("href", "https://mdivani.agency");
  });
});

describe("Markdown safety defaults", () => {
  it("does not render raw HTML", () => {
    const { container } = render(
      <Markdown>{"<script>alert(1)</script>\n\n<b>bold</b>"}</Markdown>,
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
  });

  it("blanks a javascript: link target", () => {
    const { container } = render(
      <Markdown>{"[click](javascript:alert(1))"}</Markdown>,
    );

    // Queried by tag, not by role: an anchor with an empty href is not
    // exposed as a link, which is itself part of the mitigation.
    const link = container.querySelector("a");
    expect(link).toHaveTextContent("click");
    expect(link).toHaveAttribute("href", "");
  });
});
