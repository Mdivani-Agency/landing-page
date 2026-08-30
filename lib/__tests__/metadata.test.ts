import { describe, expect, it } from "vitest";
import { createPageMetadata, socialImage } from "@/lib/metadata";
import { site } from "@/lib/site";

describe("createPageMetadata", () => {
  it("builds canonical, Open Graph, and Twitter metadata for a page", () => {
    const metadata = createPageMetadata({
      title: "Selected Work",
      description: "Case studies",
      path: "/work",
    });

    expect(metadata.title).toBe("Selected Work");
    expect(metadata.description).toBe("Case studies");
    expect(metadata.alternates?.canonical).toBe("/work");

    expect(metadata.openGraph).toMatchObject({
      title: "Selected Work",
      description: "Case studies",
      url: "/work",
      siteName: site.name,
      images: [socialImage],
    });

    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Selected Work",
      description: "Case studies",
      images: [socialImage.url],
    });
  });

  it("marks blog posts as Open Graph articles with published time", () => {
    const metadata = createPageMetadata({
      title: "From idea to a production AI product",
      description: "First slice",
      path: "/blog/idea-to-production-ai",
      type: "article",
      publishedTime: "2026-08-01T09:00:00.000Z",
      modifiedTime: "2026-08-02T09:00:00.000Z",
    });

    expect(metadata.openGraph).toMatchObject({
      type: "article",
      url: "/blog/idea-to-production-ai",
      publishedTime: "2026-08-01T09:00:00.000Z",
      modifiedTime: "2026-08-02T09:00:00.000Z",
      authors: [site.personName],
    });
  });

  it("uses the social description override only for social cards", () => {
    const metadata = createPageMetadata({
      title: "About",
      description: "Long page description",
      path: "/about",
      socialDescription: "Short social blurb",
    });

    expect(metadata.description).toBe("Long page description");
    expect(metadata.openGraph?.description).toBe("Short social blurb");
    expect(metadata.twitter?.description).toBe("Short social blurb");
  });

  it("opts a title out of the root template when it already names the brand", () => {
    const metadata = createPageMetadata({
      title: "Build your AI product from idea to production | Giorgi Mdivani",
      exactTitle: true,
      description: "Page description",
      path: "/",
    });

    expect(metadata.title).toEqual({
      absolute: "Build your AI product from idea to production | Giorgi Mdivani",
    });
    expect(metadata.openGraph?.title).toBe(
      "Build your AI product from idea to production | Giorgi Mdivani",
    );
  });
});
