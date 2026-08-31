import { Card } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { PageIntro } from "@/components/page-intro";
import { SectionTitle } from "@/components/section-header";
import { selectedWork } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "AI & Software Engineering Case Studies",
  description:
    "Selected production work by Giorgi Mdivani across insurance compliance, AI search for clinicians, aviation document intelligence, and investment analytics.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <article className="space-y-16">
      <PageIntro
        eyebrow="Work"
        title="Selected work"
        lede="Engagements Giorgi has owned or led in production. Outcomes below are from public descriptions of that work — not invented testimonials."
      />
      {selectedWork.map((item) => (
        <Card
          as="section"
          key={item.slug}
          id={item.slug}
          aria-labelledby={`${item.slug}-heading`}
          className="flex flex-col gap-1.5"
          variant="featured"
        >
          <Eyebrow>
            {item.client} · {item.role}
          </Eyebrow>
          <SectionTitle id={`${item.slug}-heading`}>{item.title}</SectionTitle>
          {item.tagline ? (
            <p className="max-w-[72rem] text-md leading-[1.55] text-muted">
              {item.tagline}
            </p>
          ) : null}
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
                {item.challenges ? "Technical challenges" : "Technical / AI challenge"}
              </dt>
              <dd className="text-sm leading-[1.55] text-muted">
                {item.challenges ? (
                  <ul className="list-disc space-y-1 pl-2.5">
                    {item.challenges.map((challenge) => (
                      <li key={challenge}>{challenge}</li>
                    ))}
                  </ul>
                ) : (
                  item.challenge
                )}
              </dd>
            </div>
            <div>
              <dt className="mb-[0.6rem] text-xs uppercase tracking-label text-secondary">
                {item.achievements ? "Achievements" : "Giorgi’s role and outcome"}
              </dt>
              <dd className="text-sm leading-[1.55] text-muted">
                {item.achievements ? (
                  <ul className="list-disc space-y-1 pl-2.5">
                    {item.achievements.map((achievement) => (
                      <li key={achievement}>{achievement}</li>
                    ))}
                  </ul>
                ) : (
                  item.outcome
                )}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-muted">{item.stack.join(" · ")}</p>
        </Card>
      ))}
    </article>
  );
}
