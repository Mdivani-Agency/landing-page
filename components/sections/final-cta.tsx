import { ConversationButton } from "@/components/conversation-button";
import { Eyebrow } from "@/components/eyebrow";
import { Section } from "@/components/section";
import { SectionCopy, SectionTitle } from "@/components/section-header";

export function FinalCta() {
  return (
    <Section
      id="talk"
      labelledBy="cta-heading"
      className="border-t border-subtle pt-6 pb-3"
    >
      <Eyebrow>Next</Eyebrow>
      <SectionTitle id="cta-heading">Tell me what you’re building.</SectionTitle>
      <SectionCopy>
        A conversation, not a quote form. Bring the idea, the constraint, and
        the date you want something in users’ hands.
      </SectionCopy>
      <ConversationButton>Let’s talk about your product</ConversationButton>
    </Section>
  );
}
