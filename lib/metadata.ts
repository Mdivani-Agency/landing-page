import type { Metadata } from "next";
import { site } from "@/lib/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
}: PageMetadataInput): Metadata {
  const canonical = path === "/" ? site.url : `${site.url}${path}`;
  const documentTitle = absoluteTitle ?? `${title} | Mdivani`;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical },
    openGraph: {
      title: documentTitle,
      description,
      url: canonical,
    },
  };
}
