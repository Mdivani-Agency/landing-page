import { describe, expect, it } from "vitest";
import {
  capabilities,
  processSteps,
  selectedWork,
  testimonials,
} from "@/lib/content";
import sitemap from "@/app/sitemap";
import {
  footerLinks,
  legalLinks,
  navLinks,
  publicPagePaths,
  site,
} from "@/lib/site";

describe("capabilities", () => {
  it("exposes exactly one featured capability with unique ids", () => {
    const featured = capabilities.filter((capability) => capability.featured);
    expect(featured).toHaveLength(1);

    const ids = capabilities.map((capability) => capability.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links every capability to a live internal page", () => {
    for (const capability of capabilities) {
      expect(publicPagePaths).toContain(capability.href);
      expect(capability.items.length).toBeGreaterThan(0);
    }
  });
});

describe("processSteps", () => {
  it("describes each step with a title and body", () => {
    expect(processSteps.length).toBeGreaterThan(0);

    for (const step of processSteps) {
      expect(step.title).not.toBe("");
      expect(step.body).not.toBe("");
    }
  });
});

describe("selectedWork", () => {
  it("anchors each case study on the work page under a unique slug", () => {
    const slugs = selectedWork.map((work) => work.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const work of selectedWork) {
      expect(work.href).toBe(`/work#${work.slug}`);
      expect(work.stack.length).toBeGreaterThan(0);
    }
  });
});

describe("testimonials", () => {
  it("gives every testimonial a unique author for React keys", () => {
    expect(testimonials.length).toBeGreaterThan(0);

    const authors = testimonials.map((testimonial) => testimonial.author);
    expect(new Set(authors).size).toBe(authors.length);
  });

  it("links every author to a LinkedIn profile", () => {
    for (const testimonial of testimonials) {
      expect(testimonial.linkedinUrl).toMatch(
        /^https:\/\/www\.linkedin\.com\//,
      );
      expect(testimonial.body).not.toBe("");
    }
  });
});

describe("site config", () => {
  it("keeps nav hrefs unique and included in the footer", () => {
    const navHrefs = navLinks.map((link) => link.href);
    expect(new Set(navHrefs).size).toBe(navHrefs.length);

    const footerHrefs = footerLinks.map((link) => link.href);
    for (const href of navHrefs) {
      expect(footerHrefs).toContain(href);
    }

    expect(navHrefs).toContain("/inquiry");
    expect(footerHrefs).not.toContain("/startup-development");
  });

  it("publishes only live public pages in the sitemap", () => {
    const sitemapUrls = sitemap().map((entry) => entry.url);
    const expectedUrls = publicPagePaths.map((path) =>
      path === "/" ? site.url : `${site.url}${path}`,
    );

    expect(sitemapUrls).toEqual(expectedUrls);
    expect(sitemapUrls).toContain(`${site.url}/how-i-work`);
    expect(sitemapUrls).not.toContain(`${site.url}/ai-engineering`);
    expect(sitemapUrls).not.toContain(`${site.url}/product-development`);
    expect(sitemapUrls).not.toContain(`${site.url}/startup-development`);
    expect(legalLinks.map((link) => link.href)).toEqual([
      "/privacy-policy",
      "/terms-of-service",
    ]);
  });

  it("points the calendar at a secure Google Calendar booking page", () => {
    expect(site.calendarUrl).toMatch(/^https:\/\/calendar\.google\.com\//);
  });
});
