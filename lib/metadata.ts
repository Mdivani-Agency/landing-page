import type { Metadata } from "next";
import { site } from "@/lib/site";

export const brandLogo = {
  url: "/assets/logo.svg",
  alt: `${site.name} mark`,
} as const;

export const socialImage = {
  url: "/assets/images/og-image.png",
  width: 1200,
  height: 630,
  alt: site.ogTitle,
} as const;

export const siteIcons = {
  icon: [
    { url: "/assets/favicon.svg", type: "image/svg+xml" },
    { url: "/assets/favicon-32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
  ],
  apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
} satisfies Metadata["icons"];

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  socialDescription?: string;
  /** Skips the root "%s | Mdivani" template, for a title that already names the brand. */
  exactTitle?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** Same-origin path or absolute URL used for Open Graph and Twitter images. */
  image?: string;
  /** Emit an RSS autodiscovery alternate on the same object as `canonical`. */
  rss?: boolean;
};

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function createPageMetadata({
  title,
  description,
  path,
  socialDescription = description,
  exactTitle = false,
  type = "website",
  publishedTime,
  modifiedTime,
  image,
  rss = false,
}: PageMetadataOptions): Metadata {
  const ogImage = image ? { url: image } : socialImage;

  return {
    title: exactTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
      ...(rss
        ? {
            types: {
              "application/rss+xml": `${site.url}/feed.xml`,
            },
          }
        : {}),
    },
    openGraph: {
      title,
      description: socialDescription,
      url: path,
      siteName: site.name,
      images: [ogImage],
      type,
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors: [site.personName],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: socialDescription,
      images: [image ?? socialImage.url],
    },
  };
}
