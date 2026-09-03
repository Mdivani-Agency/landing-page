import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WorkPage from "@/app/work/page";
import { selectedWork } from "@/lib/content";

describe("/work", () => {
  it("leads every case with the business problem and the outcome", () => {
    render(<WorkPage />);

    for (const item of selectedWork) {
      expect(screen.getByText(item.problem)).toBeInTheDocument();
      expect(screen.getByText(item.outcome)).toBeInTheDocument();
    }
  });

  it("keeps the Phoenix Court numbers out of the collapsed detail", () => {
    render(<WorkPage />);

    const numbers = screen.getByText(/30% higher engagement on insights/);
    expect(numbers.closest("details")).toBeNull();
  });

  it("parks implementation notes and the stack behind How it was built", () => {
    render(<WorkPage />);

    const disclosures = screen.getAllByText("How it was built");
    expect(disclosures).toHaveLength(selectedWork.length);

    for (const [index, item] of selectedWork.entries()) {
      const disclosure = disclosures[index].closest("details");
      expect(disclosure).not.toBeNull();
      expect(disclosure).toContainElement(screen.getByText(item.built));
      expect(disclosure).toContainElement(
        screen.getByText(item.stack.join(" · ")),
      );
    }
  });

  it("keeps the public-description disclaimer", () => {
    render(<WorkPage />);

    expect(
      screen.getByText(/from public descriptions of that work/),
    ).toBeInTheDocument();
  });
});
