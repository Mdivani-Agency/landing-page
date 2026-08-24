import { PageIntro } from "@/components/page-intro";
import { processSteps } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Startup & Greenfield Development",
  description:
    "Idea to production for founders starting without a team or a codebase. Senior-led startup software development with Giorgi Mdivani.",
  path: "/startup-development",
});

export default function StartupDevelopmentPage() {
  return (
    <article className="page-stack">
      <PageIntro
        eyebrow="Startup development"
        title="From idea to a product in production."
        lede="For founders without an existing engineering team. I take the work from definition and architecture through the first launch — and bring additional engineers when the slice is bigger than one person."
      />
      <section className="band" aria-labelledby="startup-steps-heading">
        <h2 id="startup-steps-heading" className="section-title">
          The path
        </h2>
        <ol className="process-list">
          {processSteps.map((step, index) => (
            <li key={step.title}>
              <span className="stage-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
