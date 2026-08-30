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
});
