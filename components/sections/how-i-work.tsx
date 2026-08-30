import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { StageList, StageListItem } from "@/components/stage-list";
import { processSteps } from "@/lib/content";

export function HowIWork() {
  return (
    <Section id="process" labelledBy="process-heading">
      <SectionHeader
        eyebrow="How I work"
        headingId="process-heading"
        title="Understand → Define → Architect → Build → Launch."
      />
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
  );
}
