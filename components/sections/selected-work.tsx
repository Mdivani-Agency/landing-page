import Link from "next/link";
import { selectedWork } from "@/lib/content";

export function SelectedWork() {
  return (
    <section id="work" className="band" aria-labelledby="work-heading">
      <header className="band-header">
        <p className="eyebrow">Selected work</p>
        <h2 id="work-heading" className="section-title">
          Products Giorgi has taken into production.
        </h2>
        <p className="band-copy">
          Public engagements — hospital software, aviation compliance, and
          investment analytics. Each one needed senior ownership, not a layered
          agency bench.
        </p>
      </header>
      <div className="work-list">
        {selectedWork.map((item) => (
          <article key={item.slug} className="work-card">
            <p className="eyebrow">
              {item.client} · {item.role}
            </p>
            <h3>
              <Link href={item.href}>{item.title}</Link>
            </h3>
            <p>{item.summary}</p>
            <p className="work-stack">{item.stack.join(" · ")}</p>
          </article>
        ))}
      </div>
      <Link href="/work" className="text-link">
        All selected work
      </Link>
    </section>
  );
}
