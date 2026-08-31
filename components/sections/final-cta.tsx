import { ContactCtaLink } from "@/components/conversation-button";
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
        Share a bit of context — the idea, the constraint, and when you want
        something in users’ hands. I reply to every inquiry within 1–2 business
        days.
      </SectionCopy>
      <ContactCtaLink>Let’s talk about your product</ContactCtaLink>
    </Section>
  );
}
