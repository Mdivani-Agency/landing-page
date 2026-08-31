import type { MetadataRoute } from "next";
import { legalLinks, navLinks, site } from "@/lib/site";

const pagePriority: Record<string, number> = {
  "/": 1,
  "/work": 0.8,
  "/how-i-work": 0.8,
  "/inquiry": 0.8,
  "/about": 0.7,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...navLinks.map((link) => link.href),
    ...legalLinks.map((link) => link.href),
  ];

  return paths.map((path) => ({
    url: path === "/" ? site.url : `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/privacy-policy" || path === "/terms-of-service"
      ? "yearly"
      : "monthly",
    priority: pagePriority[path] ?? 0.3,
  }));
}
