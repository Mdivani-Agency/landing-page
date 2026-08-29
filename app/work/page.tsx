import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { selectedWork } from "@/lib/content";

export const metadata: Metadata = {
  title: "Selected Work",
  description:
    "Selected production work by Giorgi Mdivani — AI search for clinicians, aviation document intelligence, and investment analytics.",
};

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
          className="band work-detail"
          aria-labelledby={`${item.slug}-heading`}
        >
          <p className="eyebrow">
            {item.client} · {item.role}
          </p>
          <h2 id={`${item.slug}-heading`} className="section-title">
            {item.title}
          </h2>
          <dl className="work-dl">
            <div>
              <dt>Problem</dt>
              <dd>{item.problem}</dd>
            </div>
            <div>
              <dt>What was built</dt>
              <dd>{item.built}</dd>
            </div>
            <div>
              <dt>Technical / AI challenge</dt>
              <dd>{item.challenge}</dd>
            </div>
            <div>
              <dt>Giorgi’s role and outcome</dt>
              <dd>{item.outcome}</dd>
            </div>
          </dl>
          <p className="work-stack">{item.stack.join(" · ")}</p>
        </section>
      ))}
    </article>
  );
}
