import Link from "next/link";
import { blogListPath, blogPaginationItems } from "@/lib/blog";
import { absoluteUrl } from "@/lib/blog-seo";

type BlogPaginationProps = {
  page: number;
  pageCount: number;
};

const controlClass =
  "inline-flex min-h-6 items-center justify-center rounded-full border px-3 text-sm leading-[1.2] no-underline";

const pageClass =
  "inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border px-2 text-sm leading-[1.2] no-underline";

export function BlogPagination({ page, pageCount }: BlogPaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const previousPage = page - 1;
  const nextPage = page + 1;
  const previousHref = previousPage >= 1 ? blogListPath(previousPage) : null;
  const nextHref = nextPage <= pageCount ? blogListPath(nextPage) : null;

  return (
    <nav
      aria-label="Blog pagination"
      className="flex flex-wrap items-center justify-center gap-1 pt-2"
    >
      {previousHref ? (
        <link rel="prev" href={absoluteUrl(previousHref)} />
      ) : null}
      {nextHref ? <link rel="next" href={absoluteUrl(nextHref)} /> : null}
      {previousHref ? (
        <Link href={previousHref} className={`${controlClass} border-subtle text-primary hover:opacity-[0.86]`}>
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={`${controlClass} border-subtle text-muted opacity-40`}>
          Previous
        </span>
      )}
      {blogPaginationItems(page, pageCount).map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="px-1 text-sm text-muted"
          >
            …
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            className={`${pageClass} border-secondary text-secondary`}
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={blogListPath(item)}
            className={`${pageClass} border-subtle text-primary hover:opacity-[0.86]`}
          >
            {item}
          </Link>
        ),
      )}
      {nextHref ? (
        <Link href={nextHref} className={`${controlClass} border-subtle text-primary hover:opacity-[0.86]`}>
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={`${controlClass} border-subtle text-muted opacity-40`}>
          Next
        </span>
      )}
    </nav>
  );
}
