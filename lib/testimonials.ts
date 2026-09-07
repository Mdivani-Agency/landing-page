import type { Testimonial } from "@/lib/content";

function shuffleInPlace<T>(items: T[], random: () => number) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
}

/**
 * Weight descending, original order kept for ties. Safe for SSR/hydration.
 */
export function sortTestimonialsByWeight(
  items: readonly Testimonial[],
): Testimonial[] {
  return [...items].sort((left, right) => right.weight - left.weight);
}

/**
 * Returns a new array: weight descending, ties shuffled. Does not mutate input.
 */
export function orderTestimonialsByWeight(
  items: readonly Testimonial[],
  random: () => number = Math.random,
): Testimonial[] {
  const groups = new Map<number, Testimonial[]>();

  for (const item of items) {
    const group = groups.get(item.weight);

    if (group) {
      group.push(item);
    } else {
      groups.set(item.weight, [item]);
    }
  }

  const playlist: Testimonial[] = [];

  for (const weight of [...groups.keys()].sort((left, right) => right - left)) {
    const group = groups.get(weight) ?? [];
    shuffleInPlace(group, random);
    playlist.push(...group);
  }

  return playlist;
}
