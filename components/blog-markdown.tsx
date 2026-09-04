import type { ReactNode } from "react";
import Markdown from "react-markdown";

type BlogMarkdownProps = {
  children: string;
};

const proseClass = [
  "text-sm leading-[1.55] text-muted",
  "[&_a]:font-medium [&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-[0.3em]",
  "[&_h2]:mt-4 [&_h2]:mb-1 [&_h2]:font-serif [&_h2]:text-heading [&_h2]:text-primary",
  "[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-serif [&_h3]:text-title [&_h3]:text-primary",
  "[&_p]:mb-1.5",
  "[&_ul]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-2.5",
  "[&_ol]:mb-1.5 [&_ol]:list-decimal [&_ol]:pl-2.5",
  "[&_li]:mb-0.5",
  "[&_code]:text-secondary",
  "[&_pre]:mb-1.5 [&_pre]:overflow-x-auto [&_pre]:rounded-card [&_pre]:border [&_pre]:border-subtle [&_pre]:bg-card [&_pre]:p-2",
].join(" ");

export function BlogMarkdown({ children }: BlogMarkdownProps) {
  return (
    <div className={proseClass}>
      <Markdown>{children}</Markdown>
    </div>
  );
}

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
