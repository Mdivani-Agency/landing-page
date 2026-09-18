import { Section } from "@/components/section";
import { SectionCopy, SectionHeader } from "@/components/section-header";

export function Founders() {
  return (
    <Section id="founders" labelledBy="founders-heading">
      <SectionHeader
        eyebrow="Who this is for"
        headingId="founders-heading"
        title="For founders under launch pressure."
      />
      <SectionCopy>
        You’re past slides. You need someone who can sit in the problem, choose
        the stack, and get a real product into users’ hands — or fix the AI
        feature that looks good in a demo and falls apart in production.
      </SectionCopy>
      <SectionCopy>
        Not for teams shopping for commodity developers by the hour.
      </SectionCopy>
    </Section>
  );
}
