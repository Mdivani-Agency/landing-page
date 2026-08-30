import type { ReactNode } from "react";
import { CardText, CardTitle } from "@/components/card";

type StageListProps = {
  className?: string;
  children: ReactNode;
};

export function StageList({ className, children }: StageListProps) {
  return (
    <ol
      className={["grid list-none gap-2", className].filter(Boolean).join(" ")}
    >
      {children}
    </ol>
  );
}

type StageListItemProps = {
  /** Zero-based position; rendered as a padded ordinal (01, 02, …). */
  index: number;
  /** Title + body form for process steps; omit and pass children for plain stages. */
  title?: string;
  body?: string;
  children?: ReactNode;
};

export function StageListItem({ index, title, body, children }: StageListItemProps) {
  return (
    <li className="flex items-start gap-2 border-t border-subtle pt-2">
      <span className="min-w-4 text-xs tracking-label text-secondary">
        {String(index + 1).padStart(2, "0")}
      </span>
      {title ? (
        <div>
          <CardTitle>{title}</CardTitle>
          {body && <CardText>{body}</CardText>}
        </div>
      ) : (
        children
      )}
    </li>
  );
}
