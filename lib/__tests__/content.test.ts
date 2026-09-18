import { describe, expect, it } from "vitest";
import {
  capabilities,
  namedOutcomes,
  processSteps,
  selectedWork,
  testimonials,
} from "@/lib/content";
import sitemap from "@/app/sitemap";
import {
  auditInquiryHref,
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

  it("describes each capability without linking off to a service page", () => {
    for (const capability of capabilities) {
      expect(capability).not.toHaveProperty("href");
      expect(capability.summary).not.toBe("");
      expect(capability.items.length).toBeGreaterThan(0);
    }
  });
});

describe("namedOutcomes", () => {
  it("leads with three named founder outcomes, not a service catalog", () => {
    expect(namedOutcomes).toHaveLength(3);

    const ids = namedOutcomes.map((outcome) => outcome.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const outcome of namedOutcomes) {
      expect(outcome).not.toHaveProperty("href");
      expect(outcome).not.toHaveProperty("items");
      expect(outcome.title).not.toBe("");
      expect(outcome.body).not.toBe("");
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
      expect(work.name).not.toBe("");
      expect(work.stack.length).toBeGreaterThan(0);
    }
  });

  it("features two to three cases with a plain-language homepage outcome", () => {
    const featured = selectedWork.filter((work) => work.homeOutcome);

    expect(featured.length).toBeGreaterThanOrEqual(2);
    expect(featured.length).toBeLessThanOrEqual(3);

    for (const work of featured) {
      expect(work.homeOutcome).not.toBe("");
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

  it("requires a numeric weight on every quote", () => {
    expect(testimonials.length).toBeGreaterThan(0);

    for (const testimonial of testimonials) {
      expect(typeof testimonial.weight).toBe("number");
    }
  });

  it("gives current-engagement recommendations the highest weight", () => {
    const weights = testimonials.map((testimonial) => testimonial.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const byAuthor = Object.fromEntries(
      testimonials.map((testimonial) => [testimonial.author, testimonial.weight]),
    );

    expect(byAuthor["David Espinosa"]).toBe(maxWeight);
    expect(byAuthor["Duncan Gordon"]).toBe(maxWeight);
    expect(byAuthor["Nick Cousins"]).toBe(minWeight);
    expect(byAuthor["Iosif Boanca"]).toBeGreaterThan(minWeight);
    expect(byAuthor["Iosif Boanca"]).toBeLessThan(maxWeight);
  });

  it("offers exactly one pull-quote, extracted verbatim from its body", () => {
    const withPullQuote = testimonials.filter(
      (testimonial) => testimonial.pullQuote,
    );

    expect(withPullQuote).toHaveLength(1);
    expect(withPullQuote[0].author).toBe("David Espinosa");
    expect(withPullQuote[0].body).toContain(withPullQuote[0].pullQuote);
  });

  it("quotes the older recommendations as published", () => {
    const nick = testimonials.find(
      (testimonial) => testimonial.author === "Nick Cousins",
    );

    expect(nick?.body).toContain("George");
    expect(nick?.pullQuote).toBeUndefined();
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
    expect(navHrefs).toContain("/blog");
    expect(auditInquiryHref).toBe("/inquiry#audit");
    expect(footerHrefs).not.toContain("/startup-development");
  });

  it("publishes only live public pages in the sitemap", async () => {
    const sitemapUrls = (await sitemap()).map((entry) => entry.url);
    const expectedUrls = publicPagePaths.map((path) =>
      path === "/" ? site.url : `${site.url}${path}`,
    );

    expect(sitemapUrls).toEqual(expect.arrayContaining(expectedUrls));
    expect(sitemapUrls).toContain(`${site.url}/how-i-work`);
    expect(sitemapUrls).toContain(`${site.url}/blog`);
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
