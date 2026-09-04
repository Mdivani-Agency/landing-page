import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { BLOG_WRITE_MIN_TOKEN_BYTES } from "../../../lib/blog-schema";
import {
  callRegisteredTool,
  listResourceDescriptors,
  listToolDescriptors,
  readResource,
} from "../registry";
import { FORMATTING_CONTRACT, FORMATTING_RESOURCE_URI } from "../resources/formatting";
import { resources } from "../resources/index";
import { tools } from "../tools/index";

const token = "x".repeat(BLOG_WRITE_MIN_TOKEN_BYTES);

describe("tool registry", () => {
  it("keeps per-tool knowledge out of server.ts", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../server.ts", import.meta.url)),
      "utf8",
    );

    expect(source).not.toMatch(
      /blog_validate_post|blog_create_post|blog_update_post|blog_list_posts|blog_get_post/,
    );
  });

  it("lists tools from the registry without server.ts knowing names", () => {
    const listed = listToolDescriptors(tools);
    const names = listed.map((tool) => tool.name);

    expect(names).toEqual([
      "blog_validate_post",
      "blog_create_post",
      "blog_update_post",
      "blog_list_posts",
      "blog_get_post",
    ]);
    expect(listed.every((tool) => tool.inputSchema)).toBe(true);
  });

  it("embeds the formatting contract in every write-tool description", () => {
    for (const name of [
      "blog_validate_post",
      "blog_create_post",
      "blog_update_post",
    ]) {
      const tool = tools.find((entry) => entry.name === name);
      expect(tool?.description).toContain(FORMATTING_CONTRACT);
    }
  });

  it("marks write tools destructive and validate/list/get read-only", () => {
    expect(tools.find((tool) => tool.name === "blog_create_post")?.annotations).toEqual({
      readOnlyHint: false,
      destructiveHint: true,
    });
    expect(tools.find((tool) => tool.name === "blog_validate_post")?.annotations).toEqual(
      {
        readOnlyHint: true,
        destructiveHint: false,
      },
    );
  });

  it("validates a draft locally without a network call", async () => {
    const request = vi.fn();
    const result = await callRegisteredTool(
      tools,
      "blog_validate_post",
      {
        title: "A new note",
        description: "Enough description for the card.",
        content: "## Hello\n\nThis is enough markdown content.",
      },
      { baseUrl: "http://localhost:3000", token, request },
    );

    expect(request).not.toHaveBeenCalled();
    expect(result.isError).toBeFalsy();
    const payload = JSON.parse(result.content[0].text) as {
      ok: boolean;
      slug: string;
      value: { status: string };
    };
    expect(payload.ok).toBe(true);
    expect(payload.slug).toBe("a-new-note");
    expect(payload.value.status).toBe("draft");
  });

  it("creates a post without sending slug", async () => {
    const request = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      baseUrl: "http://localhost:3000",
      data: { ok: true, post: { slug: "a-new-note" } },
    });

    const result = await callRegisteredTool(
      tools,
      "blog_create_post",
      {
        title: "A new note",
        description: "Enough description for the card.",
        content: "## Hello\n\nThis is enough markdown content.",
        slug: "should-be-stripped",
      },
      { baseUrl: "http://localhost:3000", token, request },
    );

    expect(request).toHaveBeenCalledWith("POST", "/api/posts", {
      title: "A new note",
      description: "Enough description for the card.",
      content: "## Hello\n\nThis is enough markdown content.",
    });
    expect(result.content[0].text).toContain("http://localhost:3000");
  });

  it("requires slug on update and echoes the target URL", async () => {
    const request = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      baseUrl: "https://mdivani.agency",
      data: { ok: true, post: { slug: "a-new-note" } },
    });

    await callRegisteredTool(
      tools,
      "blog_update_post",
      {
        slug: "a-new-note",
        title: "A new note",
        description: "Enough description for the card.",
        content: "## Hello\n\nThis is enough markdown content.",
        status: "published",
      },
      { baseUrl: "https://mdivani.agency", token, request },
    );

    expect(request).toHaveBeenCalledWith(
      "POST",
      "/api/posts",
      expect.objectContaining({ slug: "a-new-note", status: "published" }),
    );
  });

  it("lists and gets posts through the authenticated read path", async () => {
    const request = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      baseUrl: "http://localhost:3000",
      data: { ok: true, posts: [] },
    });

    await callRegisteredTool(
      tools,
      "blog_list_posts",
      { status: "draft" },
      { baseUrl: "http://localhost:3000", token, request },
    );
    await callRegisteredTool(
      tools,
      "blog_get_post",
      { slug: "a-new-note" },
      { baseUrl: "http://localhost:3000", token, request },
    );

    expect(request).toHaveBeenNthCalledWith(1, "GET", "/api/posts?status=draft");
    expect(request).toHaveBeenNthCalledWith(2, "GET", "/api/posts/a-new-note");
  });

  it("returns a configuration error when the write token is missing", async () => {
    const request = vi.fn();
    const result = await callRegisteredTool(
      tools,
      "blog_create_post",
      {
        title: "A new note",
        description: "Enough description for the card.",
        content: "## Hello\n\nThis is enough markdown content.",
      },
      { baseUrl: "http://localhost:3000", token: "", request },
    );

    expect(request).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("BLOG_WRITE_TOKEN");
  });

  it("maps a 409 from the API into an actionable error", async () => {
    const request = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      baseUrl: "http://localhost:3000",
      message:
        "A post with that slug already exists (a-new-note). Call blog_update_post to change it, or choose a different title.",
    });

    const result = await callRegisteredTool(
      tools,
      "blog_create_post",
      {
        title: "A new note",
        description: "Enough description for the card.",
        content: "## Hello\n\nThis is enough markdown content.",
      },
      { baseUrl: "http://localhost:3000", token, request },
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("blog_update_post");
  });
});

describe("resource registry", () => {
  it("serves the formatting contract", () => {
    const listed = listResourceDescriptors(resources);
    expect(listed).toEqual([
      expect.objectContaining({
        uri: FORMATTING_RESOURCE_URI,
        mimeType: "text/markdown",
      }),
    ]);

    const resource = readResource(resources, FORMATTING_RESOURCE_URI);
    expect(resource?.text).toBe(FORMATTING_CONTRACT);
    expect(resource?.text).toContain("Start headings at ##");
    expect(resource?.text).toContain("No raw HTML");
  });
});
