import type { Metadata } from "next";
import { site } from "@/lib/site";

export const socialImage = {
  url: "/assets/images/giorgi.jpg",
  width: 1024,
  height: 1024,
  alt: `${site.personName}, ${site.personRole}`,
} as const;

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
};

export function createPageMetadata({
  title,
  description,
  path,
  socialDescription = description,
  exactTitle = false,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  return {
    title: exactTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description: socialDescription,
      url: path,
      siteName: site.name,
      images: [socialImage],
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
      images: [socialImage.url],
    },
  };
}
