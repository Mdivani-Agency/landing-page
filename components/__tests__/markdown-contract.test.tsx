import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "@/components/markdown";

/**
 * A post written from the MCP formatting contract alone. The acceptance
 * bar for MDI-103 is that this body renders correctly with no manual fixes.
 */
const agentBody = `## Start with a job

The model is not the product. A founder needs a first slice that can
[reach production](/how-i-work).

## What we ship

- A narrow workflow
- An evaluation loop
- A path to scale

| Stage | Owner |
| --- | --- |
| Discovery | Giorgi |
| First slice | Shared |

\`\`\`ts
const firstSlice = "ship the job"
\`\`\`

See https://mdivani.agency for the studio model.

~~Guesswork~~ is replaced by a measured loop.

- [x] scoped
- [ ] shipped
`;

describe("agent-written Markdown against the renderer contract", () => {
  it("renders headings, GFM, and links without an extra h1 or raw HTML", () => {
    const { container } = render(<Markdown>{agentBody}</Markdown>);

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(
      screen.getByRole("heading", { level: 2, name: "Start with a job" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "What we ship" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "reach production" }),
    ).toHaveAttribute("href", "/how-i-work");
    expect(
      screen.getByRole("link", { name: "https://mdivani.agency" }),
    ).toHaveAttribute("href", "https://mdivani.agency");
    expect(screen.getByRole("columnheader", { name: "Stage" })).toBeInTheDocument();
    expect(container.querySelector("pre")).toHaveTextContent("ship the job");
    expect(container.querySelector("del")).toHaveTextContent("Guesswork");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("h1")).toBeNull();
  });
});
