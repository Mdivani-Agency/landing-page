import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFakeSupabase,
  fakeBlogRows,
  type FakeSupabase,
} from "@/test-utils/supabase-mock";

const state = vi.hoisted(() => ({
  client: undefined as unknown as FakeSupabase,
}));

vi.mock("@/lib/supabase", async () => {
  const { supabaseModuleMock } = await import("@/test-utils/supabase-mock");
  return supabaseModuleMock(() => state.client);
});

import BlogPage from "@/app/blog/page";

beforeEach(() => {
  state.client = createFakeSupabase(fakeBlogRows);
});

describe("/blog", () => {
  it("puts featured posts above the chronological grid with distinct treatment", async () => {
    render(await BlogPage());

    expect(
      screen.getByRole("heading", { level: 2, name: "Featured posts" }),
    ).toBeInTheDocument();

    const featuredLink = screen.getByRole("link", {
      name: "From idea to a production AI product",
    });
    const restLink = screen.getByRole("link", {
      name: "Shipping the first slice",
    });

    expect(
      featuredLink.compareDocumentPosition(restLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const featuredCard = featuredLink.closest("article");
    expect(featuredCard).toHaveClass("border-[rgba(159,212,200,0.35)]");
    expect(featuredCard).toHaveTextContent("Featured");

    const restCard = restLink.closest("article");
    expect(restCard).toHaveClass("border-subtle");
    expect(restCard).not.toHaveTextContent("Featured");
  });

  it("shows the empty state when nothing is published", async () => {
    state.client = createFakeSupabase([]);

    render(await BlogPage());

    expect(screen.getByText("No posts published yet.")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Featured posts" }),
    ).not.toBeInTheDocument();
  });
});
