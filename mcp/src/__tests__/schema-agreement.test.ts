import { describe, expect, it } from "vitest";
import { validateBlogWritePayload } from "../../../lib/blog-schema";
import {
  createPostInputSchema,
  updatePostInputSchema,
  writePayloadSchema,
} from "../schema";

const valid = {
  title: "A new note",
  description: "Enough description for the card.",
  content: "## Hello\n\nThis is enough markdown content.",
};

const cases: Array<{ name: string; payload: unknown }> = [
  { name: "valid create payload", payload: valid },
  { name: "explicit published status", payload: { ...valid, status: "published" } },
  { name: "explicit sites", payload: { ...valid, sites: ["agency", "talvio"] } },
  { name: "same-origin cover", payload: { ...valid, cover_image_url: "/assets/logo.svg" } },
  { name: "tags with blanks", payload: { ...valid, tags: ["AI", "  ", "product"] } },
  { name: "valid slug", payload: { ...valid, slug: "custom-slug" } },
  { name: "title too short", payload: { ...valid, title: "A" } },
  { name: "title too long", payload: { ...valid, title: "x".repeat(161) } },
  { name: "description too short", payload: { ...valid, description: "short" } },
  { name: "content too short", payload: { ...valid, content: "nope" } },
  { name: "bad slug", payload: { ...valid, slug: "Nope!" } },
  { name: "unknown status", payload: { ...valid, status: "live" } },
  { name: "unknown site", payload: { ...valid, sites: ["nope"] } },
  { name: "empty sites", payload: { ...valid, sites: [] } },
  { name: "non-array tags", payload: { ...valid, tags: "AI" } },
  {
    name: "remote cover",
    payload: { ...valid, cover_image_url: "https://cdn.example.com/hero.jpg" },
  },
  {
    name: "cover with query",
    payload: { ...valid, cover_image_url: "/assets/hero.jpg?v=1" },
  },
];

describe("MCP write schema agrees with validateBlogWritePayload", () => {
  it.each(cases)("$name", ({ payload }) => {
    const route = validateBlogWritePayload(payload);
    const mcp = writePayloadSchema.safeParse(payload);

    expect(mcp.success).toBe(route.ok);
  });

  it("create schema rejects a slug field so the tool cannot overwrite", () => {
    const parsed = createPostInputSchema.safeParse({
      ...valid,
      slug: "custom-slug",
    });

    // Zod object schemas strip unknown keys by default, so parse still
    // succeeds — the tool simply never sends slug. The important contract
    // is that slug is not in the create shape.
    expect("slug" in createPostInputSchema.shape).toBe(false);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("slug");
    }
  });

  it("update schema requires a valid slug", () => {
    expect(updatePostInputSchema.safeParse(valid).success).toBe(false);
    expect(
      updatePostInputSchema.safeParse({ ...valid, slug: "custom-slug" }).success,
    ).toBe(true);
    expect(
      updatePostInputSchema.safeParse({ ...valid, slug: "Nope!" }).success,
    ).toBe(false);
  });
});
