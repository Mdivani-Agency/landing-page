import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  children: string;
};

// react-markdown does not render raw HTML unless `rehype-raw` is added, and
// its default URL transform blanks any protocol outside http(s), irc(s),
// mailto, and xmpp. Content reaches this component from the write API, so
// both defaults are load-bearing — do not add `rehype-raw`.
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
  "[&_blockquote]:mb-1.5 [&_blockquote]:border-l [&_blockquote]:border-subtle [&_blockquote]:pl-2 [&_blockquote]:text-secondary",
  "[&_hr]:my-3 [&_hr]:border-subtle",
  // GFM tables.
  "[&_table]:w-full [&_table]:border-collapse [&_table]:text-left",
  "[&_th]:border-b [&_th]:border-subtle [&_th]:py-1 [&_th]:pr-2 [&_th]:font-medium [&_th]:text-primary",
  "[&_td]:border-t [&_td]:border-subtle [&_td]:py-1 [&_td]:pr-2 [&_td]:align-top",
  // GFM task lists, which arrive with these classes from mdast-util-to-hast.
  "[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0",
  "[&_.task-list-item]:flex [&_.task-list-item]:items-baseline [&_.task-list-item]:gap-0.5",
].join(" ");

export function Markdown({ children }: MarkdownProps) {
  return (
    <div className={proseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // A wide table should scroll within its own box rather than push
          // the page sideways on a narrow viewport.
          table: ({ node: _node, ...props }) => (
            <div className="mb-1.5 overflow-x-auto">
              <table {...props} />
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
