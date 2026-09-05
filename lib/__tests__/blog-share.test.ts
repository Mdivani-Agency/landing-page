import { describe, expect, it } from "vitest";
import { buildShareText, getBlogShareLinks } from "@/lib/blog-share";

const url = "https://mdivani.agency/blog/idea-to-production-ai";
const title = "From idea to a production AI product";
const description = "How the first slice gets to production.";

describe("buildShareText", () => {
  it("uses the title when there is no description", () => {
    expect(buildShareText(title)).toBe(title);
    expect(buildShareText(title, "   ")).toBe(title);
  });

  it("appends a trimmed description and truncates long text", () => {
    expect(buildShareText(title, `  ${description}  `)).toBe(
      `${title} — ${description}`,
    );

    const longDescription = "word ".repeat(80);
    const text = buildShareText(title, longDescription);

    expect(text.endsWith("…")).toBe(true);
    expect(text.length).toBeLessThanOrEqual(200);
    expect(text.startsWith(`${title} — `)).toBe(true);
  });
});

describe("getBlogShareLinks", () => {
  it("builds encoded LinkedIn, X, and Reddit intent URLs", () => {
    const [linkedin, x, reddit] = getBlogShareLinks({ url, title, description });
    const encodedUrl = encodeURIComponent(url);
    const text = buildShareText(title, description);

    expect(linkedin).toEqual({
      network: "linkedin",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    });
    expect(x).toEqual({
      network: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
    });
    expect(reddit).toEqual({
      network: "reddit",
      label: "Share on Reddit",
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}`,
    });
  });

  it("encodes reserved characters in the canonical URL and title", () => {
    const awkwardUrl = "https://mdivani.agency/blog/a&b?c=d";
    const awkwardTitle = "50% done & shipped";
    const [linkedin, x, reddit] = getBlogShareLinks({
      url: awkwardUrl,
      title: awkwardTitle,
    });

    expect(linkedin.href).toContain(encodeURIComponent(awkwardUrl));
    expect(x.href).toContain(encodeURIComponent(awkwardTitle));
    expect(reddit.href).toContain(`title=${encodeURIComponent(awkwardTitle)}`);
    expect(linkedin.href).not.toContain("a&b?c=d");
  });
});
