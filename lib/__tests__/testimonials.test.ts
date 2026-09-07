import { describe, expect, it } from "vitest";
import { testimonials, type Testimonial } from "@/lib/content";
import {
  orderTestimonialsByWeight,
  sortTestimonialsByWeight,
} from "@/lib/testimonials";

function quote(author: string, weight: number): Testimonial {
  return {
    author,
    weight,
    linkedinUrl: `https://www.linkedin.com/in/${author.toLowerCase()}/`,
    body: `${author} quote`,
  };
}

function constantly(value: number) {
  return () => value;
}

describe("orderTestimonialsByWeight", () => {
  it("orders distinct weights strictly descending", () => {
    const items = [quote("Low", 1), quote("High", 100), quote("Mid", 50)];

    expect(
      orderTestimonialsByWeight(items, constantly(0)).map((item) => item.author),
    ).toEqual(["High", "Mid", "Low"]);
    expect(
      orderTestimonialsByWeight(items, constantly(0.99)).map(
        (item) => item.author,
      ),
    ).toEqual(["High", "Mid", "Low"]);
  });

  it("keeps equal max-weight items ahead of lower weights and last weight last", () => {
    const items = [
      quote("Mid", 50),
      quote("Last", 1),
      quote("LeadA", 100),
      quote("LeadB", 100),
    ];

    const preserveTies = orderTestimonialsByWeight(items, constantly(0.99));
    const reverseTies = orderTestimonialsByWeight(items, constantly(0));

    expect(preserveTies.map((item) => item.author)).toEqual([
      "LeadA",
      "LeadB",
      "Mid",
      "Last",
    ]);
    expect(reverseTies.map((item) => item.author)).toEqual([
      "LeadB",
      "LeadA",
      "Mid",
      "Last",
    ]);

    for (const playlist of [preserveTies, reverseTies]) {
      expect(playlist.slice(0, 2).map((item) => item.author).sort()).toEqual([
        "LeadA",
        "LeadB",
      ]);
      expect(playlist[2]?.author).toBe("Mid");
      expect(playlist.at(-1)?.author).toBe("Last");
    }
  });

  it("places a new mid-weight quote between existing groups without name checks", () => {
    const items = [
      quote("A", 100),
      quote("B", 50),
      quote("C", 1),
      quote("New", 80),
    ];

    expect(
      orderTestimonialsByWeight(items, constantly(0)).map((item) => item.weight),
    ).toEqual([100, 80, 50, 1]);
  });

  it("does not mutate the input array or its items", () => {
    const items = [quote("Low", 1), quote("High", 100)];
    const snapshot = items.map((item) => ({ ...item }));

    orderTestimonialsByWeight(items, constantly(0));

    expect(items).toEqual(snapshot);
  });

  it("returns a new empty array for empty input", () => {
    const items: readonly Testimonial[] = [];

    expect(orderTestimonialsByWeight(items)).toEqual([]);
    expect(orderTestimonialsByWeight(items)).not.toBe(items);
  });
});

describe("sortTestimonialsByWeight", () => {
  it("keeps original order for equal weights", () => {
    const items = [quote("First", 100), quote("Second", 100), quote("Low", 1)];

    expect(
      sortTestimonialsByWeight(items).map((item) => item.author),
    ).toEqual(["First", "Second", "Low"]);
  });
});

describe("homepage testimonials playlist", () => {
  it("always leads with a max-weight quote and ends with the min-weight quote", () => {
    const weights = testimonials.map((testimonial) => testimonial.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const firstAuthors = new Set<string>();

    for (let index = 0; index < 40; index += 1) {
      const playlist = orderTestimonialsByWeight(testimonials);

      expect(playlist[0]?.weight).toBe(maxWeight);
      expect(playlist.at(-1)?.weight).toBe(minWeight);
      expect(playlist.map((item) => item.weight)).toEqual(
        [...weights].sort((left, right) => right - left),
      );

      if (playlist[0]) {
        firstAuthors.add(playlist[0].author);
      }
    }

    expect(firstAuthors.size).toBeGreaterThan(1);
  });
});
