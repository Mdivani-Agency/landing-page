import { describe, expect, it } from "vitest";
import { metadata as aboutMetadata } from "@/app/about/page";
import { metadata as homeMetadata } from "@/app/page";

const MARKETPLACE_PATTERN = /toptal|upwork/i;

function titleText(title: unknown): string {
  if (typeof title === "string") {
    return title;
  }

  if (title && typeof title === "object" && "absolute" in title) {
    return String((title as { absolute: unknown }).absolute);
  }

  return "";
}

describe("primary page metadata", () => {
  it("leads the homepage with the promise, not a job title", () => {
    expect(titleText(homeMetadata.title)).toBe(
      "Build your AI product from idea to production | Giorgi Mdivani",
    );
  });

  it("keeps marketplace names out of the / and /about titles and descriptions", () => {
    for (const metadata of [homeMetadata, aboutMetadata]) {
      expect(titleText(metadata.title)).not.toMatch(MARKETPLACE_PATTERN);
      expect(metadata.description).not.toMatch(MARKETPLACE_PATTERN);
      expect(metadata.openGraph?.description).not.toMatch(MARKETPLACE_PATTERN);
      expect(metadata.twitter?.description).not.toMatch(MARKETPLACE_PATTERN);
    }
  });
});
