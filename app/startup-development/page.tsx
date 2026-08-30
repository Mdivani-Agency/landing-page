import { PageIntro } from "@/components/page-intro";
import { Section } from "@/components/section";
import { SectionTitle } from "@/components/section-header";
import { StageList, StageListItem } from "@/components/stage-list";
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
      <Section labelledBy="startup-steps-heading">
        <SectionTitle id="startup-steps-heading">The path</SectionTitle>
        <StageList>
          {processSteps.map((step, index) => (
            <StageListItem
              key={step.title}
              index={index}
              title={step.title}
              body={step.body}
            />
          ))}
        </StageList>
      </Section>
    </article>
  );
}
