import Link from "next/link";
import { selectedWork } from "@/lib/content";

export function SelectedWork() {
  return (
    <section
      id="work"
      className="flex flex-col gap-1.5"
      aria-labelledby="work-heading"
    >
      <header className="flex flex-col gap-1.5">
        <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
          Selected work
        </p>
        <h2 id="work-heading" className="max-w-[22ch] font-serif text-heading">
          Products Giorgi has taken into production.
        </h2>
        <p className="max-w-[62rem] text-md leading-[1.55] text-muted">
          Public engagements — hospital software, aviation compliance, and
          investment analytics. Each one needed senior ownership, not a layered
          agency bench.
        </p>
      </header>
      <div className="grid gap-2 md:grid-cols-2">
        {selectedWork.map((item) => (
          <article
            key={item.slug}
            className="rounded-card border border-subtle bg-card p-3"
          >
            <p className="mb-1.5 text-sm uppercase leading-4 tracking-caps text-muted">
              {item.client} · {item.role}
            </p>
            <h3 className="mb-1.5 font-serif text-title font-medium">
              <Link href={item.href}>{item.title}</Link>
            </h3>
            <p className="text-sm leading-4 text-muted">{item.outcome}</p>
            <p className="text-sm leading-4 text-muted">
              {item.stack.join(" · ")}
            </p>
          </article>
        ))}
      </div>
      <Link
        href="/work"
        className="inline-flex items-center justify-center text-sm leading-[1.2] text-secondary underline underline-offset-[0.3em]"
      >
        All selected work
      </Link>
    </section>
  );
}
