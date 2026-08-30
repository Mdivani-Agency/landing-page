import { PageIntro } from "@/components/page-intro";
import { selectedWork } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "AI & Software Engineering Case Studies",
  description:
    "Selected production work by Giorgi Mdivani — AI search for clinicians, aviation document intelligence, and investment analytics.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <article className="space-y-16 divide-y divide-gray-100">
      <PageIntro
        eyebrow="Work"
        title="Selected work"
        lede="Engagements Giorgi has owned or led in production. Outcomes below are from public descriptions of that work — not invented testimonials."
      />
      {selectedWork.map((item) => (
        <section
          key={item.slug}
          id={item.slug}
          className="flex flex-col gap-1.5"
          aria-labelledby={`${item.slug}-heading`}
        >
          <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
            {item.client} · {item.role}
          </p>
          <h2
            id={`${item.slug}-heading`}
            className="max-w-[22ch] font-serif text-heading"
          >
            {item.title}
          </h2>
          <dl className="grid gap-2.5">
            <div>
              <dt className="mb-[0.6rem] text-xs uppercase tracking-label text-secondary">
                Problem
              </dt>
              <dd className="text-sm leading-[1.55] text-muted">
                {item.problem}
              </dd>
            </div>
            <div>
              <dt className="mb-[0.6rem] text-xs uppercase tracking-label text-secondary">
                What was built
              </dt>
              <dd className="text-sm leading-[1.55] text-muted">{item.built}</dd>
            </div>
            <div>
              <dt className="mb-[0.6rem] text-xs uppercase tracking-label text-secondary">
                Technical / AI challenge
              </dt>
              <dd className="text-sm leading-[1.55] text-muted">
                {item.challenge}
              </dd>
            </div>
            <div>
              <dt className="mb-[0.6rem] text-xs uppercase tracking-label text-secondary">
                Giorgi’s role and outcome
              </dt>
              <dd className="text-sm leading-[1.55] text-muted">
                {item.outcome}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-muted">{item.stack.join(" · ")}</p>
        </section>
      ))}
    </article>
  );
}
