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

import { metadata as aboutMetadata } from "@/app/about/page";
import { generateMetadata as generatePostMetadata } from "@/app/blog/[slug]/page";
import { metadata as blogMetadata } from "@/app/blog/page";
import { metadata as homeMetadata } from "@/app/page";
import { site } from "@/lib/site";

const MARKETPLACE_PATTERN = /toptal|upwork/i;

beforeEach(() => {
  state.client = createFakeSupabase(fakeBlogRows);
});

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
      "Senior software ownership for founders who need to ship | Mdivani Agency",
    );
    expect(homeMetadata.description).toBe(
      "Prototype-to-production sprints, AI that survives real users, and fractional senior ownership — for UK and US founders who need a critical path owner, not a staff-aug bench.",
    );
  });

  it("names the brand once in the /about title", () => {
    // Opting out of the root "%s | Mdivani" template: the surname already
    // carries the brand, and it keeps <title> and the OG title identical.
    expect(aboutMetadata.title).toEqual({
      absolute: "Giorgi Mdivani — founder & lead AI engineer",
    });
    expect(titleText(aboutMetadata.title)).toBe(aboutMetadata.openGraph?.title);
  });

  it("keeps marketplace names out of the / and /about titles and descriptions", () => {
    for (const metadata of [homeMetadata, aboutMetadata]) {
      expect(titleText(metadata.title)).not.toMatch(MARKETPLACE_PATTERN);
      expect(metadata.description).not.toMatch(MARKETPLACE_PATTERN);
      expect(metadata.openGraph?.description).not.toMatch(MARKETPLACE_PATTERN);
      expect(metadata.twitter?.description).not.toMatch(MARKETPLACE_PATTERN);
    }
  });

  it("keeps the RSS alternate on resolved blog listing metadata", () => {
    expect(blogMetadata.alternates).toEqual({
      canonical: "/blog",
      types: {
        "application/rss+xml": `${site.url}/feed.xml`,
      },
    });
  });

  it("keeps the RSS alternate on resolved post metadata", async () => {
    const metadata = await generatePostMetadata({
      params: Promise.resolve({ slug: "idea-to-production-ai" }),
    });

    expect(metadata.alternates).toEqual({
      canonical: "/blog/idea-to-production-ai",
      types: {
        "application/rss+xml": `${site.url}/feed.xml`,
      },
    });
  });
});
