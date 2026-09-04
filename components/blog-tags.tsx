import type { ReactNode } from "react";

export function BlogTags({ tags }: { tags: string[] }): ReactNode {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <li
          key={tag}
          className="text-xs uppercase tracking-caps text-secondary"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
