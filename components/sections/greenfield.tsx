import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { StageList, StageListItem } from "@/components/stage-list";
import { TextLink } from "@/components/text-link";

const stages = [
  "Idea",
  "Definition",
  "Architecture",
  "Build",
  "Launch",
] as const;

export function Greenfield() {
  return (
    <Section id="greenfield" labelledBy="greenfield-heading">
      <SectionHeader
        eyebrow="Starting from zero"
        headingId="greenfield-heading"
        title="Starting with an idea, not a codebase?"
        copy="Most founders I work with do not have an existing team or a legacy system to wrap. The job is to go from a sharp idea to a product in production — without a large outsourced team in the middle."
      />
      <StageList className="md:grid-cols-3 lg:grid-cols-5">
        {stages.map((stage, index) => (
          <StageListItem key={stage} index={index}>
            <span>{stage}</span>
          </StageListItem>
        ))}
      </StageList>
      <p>
        <TextLink href="/startup-development">
          How greenfield engagements work
        </TextLink>
      </p>
    </Section>
  );
}
