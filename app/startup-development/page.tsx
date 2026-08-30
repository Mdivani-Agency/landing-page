import { PageIntro } from "@/components/page-intro";
import { processSteps } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Startup & Greenfield Development",
  description:
    "Idea to production for founders starting without a team or a codebase. Senior-led startup software development with Giorgi Mdivani.",
  path: "/startup-development",
});

export default function StartupDevelopmentPage() {
  return (
    <article>
      <PageIntro
        eyebrow="Startup development"
        title="From idea to a product in production."
        lede="For founders without an existing engineering team. I take the work from definition and architecture through the first launch — and bring additional engineers when the slice is bigger than one person."
      />
      <section
        className="flex flex-col gap-1.5"
        aria-labelledby="startup-steps-heading"
      >
        <h2
          id="startup-steps-heading"
          className="max-w-[22ch] font-serif text-heading"
        >
          The path
        </h2>
        <ol className="grid list-none gap-2">
          {processSteps.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-2 border-t border-subtle pt-2"
            >
              <span className="min-w-4 text-xs tracking-label text-secondary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="mb-1.5 font-serif text-title font-medium">
                  {step.title}
                </h3>
                <p className="text-sm leading-4 text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
