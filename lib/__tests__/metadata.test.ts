import { describe, expect, it } from "vitest";
import {
  brandLogo,
  createPageMetadata,
  serializeJsonLd,
  siteIcons,
  socialImage,
} from "@/lib/metadata";
import { site } from "@/lib/site";

describe("brand assets", () => {
  it("declares a 1200×630 Open Graph image and a real favicon set", () => {
    expect(socialImage).toEqual({
      url: "/assets/images/og-image.png",
      width: 1200,
      height: 630,
      alt: site.ogTitle,
    });
    expect(brandLogo.url).toBe("/assets/logo.svg");
    expect(siteIcons.icon).toEqual([
      { url: "/assets/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
    ]);
    expect(siteIcons.apple).toEqual([
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ]);
  });
});

describe("createPageMetadata", () => {
  it("builds canonical, Open Graph, and Twitter metadata for a page", () => {
    const metadata = createPageMetadata({
      title: "Selected Work",
      description: "Case studies",
      path: "/work",
    });

    expect(metadata.title).toBe("Selected Work");
    expect(metadata.description).toBe("Case studies");
    expect(metadata.alternates).toEqual({ canonical: "/work" });

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

  it("keeps the RSS alternate on the same object as canonical", () => {
    const metadata = createPageMetadata({
      title: "Blog",
      description: "Notes",
      path: "/blog",
      rss: true,
    });

    expect(metadata.alternates).toEqual({
      canonical: "/blog",
      types: {
        "application/rss+xml": `${site.url}/feed.xml`,
      },
    });
  });

  it("uses a cover image for Open Graph and Twitter when provided", () => {
    const metadata = createPageMetadata({
      title: "Covered post",
      description: "First slice",
      path: "/blog/covered",
      type: "article",
      image: "/assets/logo.svg",
    });

    expect(metadata.openGraph?.images).toEqual([{ url: "/assets/logo.svg" }]);
    expect(metadata.twitter?.images).toEqual(["/assets/logo.svg"]);
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

describe("serializeJsonLd", () => {
  it("escapes </script> so it cannot break a JSON-LD script tag", () => {
    const serialized = serializeJsonLd({
      title: "Foo </script><script>alert(1)",
    });

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script>");
  });
});
