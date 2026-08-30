import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    types: {
      "application/rss+xml": `${site.url}/feed.xml`,
    },
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
