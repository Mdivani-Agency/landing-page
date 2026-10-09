import { describe, expect, it } from "vitest";
import {
  BLOG_READ_DEFAULT_LIMIT,
  BLOG_READ_MAX_LIMIT,
  BLOG_READ_MAX_OFFSET,
  BLOG_READ_MIN_TOKEN_BYTES,
  parseTalvioPostsQuery,
  readTalvioReadTokens,
  talvioReadTokenProblems,
} from "@/lib/blog-read";

const TOKEN = "t".repeat(BLOG_READ_MIN_TOKEN_BYTES);
const NEXT = "n".repeat(BLOG_READ_MIN_TOKEN_BYTES);

describe("readTalvioReadTokens", () => {
  it("accepts a current token and an optional next token", () => {
    expect(readTalvioReadTokens({ BLOG_READ_TOKEN_TALVIO: TOKEN })).toEqual({
      current: TOKEN,
    });
    expect(
      readTalvioReadTokens({
        BLOG_READ_TOKEN_TALVIO: ` ${TOKEN} `,
        BLOG_READ_TOKEN_TALVIO_NEXT: NEXT,
      }),
    ).toEqual({ current: TOKEN, next: NEXT });
  });

  it("rejects a missing, short, or short-next configuration", () => {
    expect(readTalvioReadTokens({})).toBeUndefined();
    expect(
      readTalvioReadTokens({ BLOG_READ_TOKEN_TALVIO: "short" }),
    ).toBeUndefined();
    expect(
      readTalvioReadTokens({
        BLOG_READ_TOKEN_TALVIO: TOKEN,
        BLOG_READ_TOKEN_TALVIO_NEXT: "short",
      }),
    ).toBeUndefined();
    expect(
      talvioReadTokenProblems({
        BLOG_READ_TOKEN_TALVIO: TOKEN,
        BLOG_READ_TOKEN_TALVIO_NEXT: "short",
      }),
    ).toEqual([{ name: "BLOG_READ_TOKEN_TALVIO_NEXT", reason: "invalid" }]);
  });

  it("rejects a read token that matches the write token", () => {
    const write = "w".repeat(BLOG_READ_MIN_TOKEN_BYTES);

    expect(
      readTalvioReadTokens({
        BLOG_READ_TOKEN_TALVIO: write,
        BLOG_WRITE_TOKEN: ` ${write} `,
      }),
    ).toBeUndefined();
    expect(
      talvioReadTokenProblems({
        BLOG_READ_TOKEN_TALVIO: TOKEN,
        BLOG_READ_TOKEN_TALVIO_NEXT: write,
        BLOG_WRITE_TOKEN: write,
      }),
    ).toEqual([{ name: "BLOG_READ_TOKEN_TALVIO_NEXT", reason: "collides" }]);
    expect(
      talvioReadTokenProblems({
        BLOG_READ_TOKEN_TALVIO: TOKEN,
        BLOG_WRITE_TOKEN: write,
      }),
    ).toEqual([]);
  });
});

describe("parseTalvioPostsQuery", () => {
  it("defaults limit and offset", () => {
    expect(parseTalvioPostsQuery(new URL("http://localhost/api/talvio/posts"))).toEqual({
      ok: true,
      limit: BLOG_READ_DEFAULT_LIMIT,
      offset: 0,
    });
  });

  it("accepts the maximum page and offset", () => {
    const url = new URL(
      `http://localhost/api/talvio/posts?limit=${BLOG_READ_MAX_LIMIT}&offset=${BLOG_READ_MAX_OFFSET}`,
    );

    expect(parseTalvioPostsQuery(url)).toEqual({
      ok: true,
      limit: BLOG_READ_MAX_LIMIT,
      offset: BLOG_READ_MAX_OFFSET,
    });
  });

  it("rejects a page that could exceed max_rows, and a bad offset", () => {
    const url = new URL(
      `http://localhost/api/talvio/posts?limit=${BLOG_READ_MAX_LIMIT + 1}&offset=-1`,
    );
    const parsed = parseTalvioPostsQuery(url);

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errors.limit).toMatch(/1 to 100/);
      expect(parsed.errors.offset).toMatch(/0 to 100000/);
    }
  });
});
