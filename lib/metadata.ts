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
};

export function createPageMetadata({
  title,
  description,
  path,
  socialDescription = description,
}: PageMetadataOptions): Metadata {
  return {
    title,
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
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: socialDescription,
      images: [socialImage.url],
    },
  };
}
