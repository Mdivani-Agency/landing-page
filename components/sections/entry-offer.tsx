import { ContactCtaLink } from "@/components/conversation-button";
import { Section } from "@/components/section";
import { SectionCopy, SectionHeader } from "@/components/section-header";
import { auditInquiryHref } from "@/lib/site";

export function EntryOffer() {
  return (
    <Section id="audit-offer" labelledBy="audit-offer-heading">
      <SectionHeader
        eyebrow="Where to start"
        headingId="audit-offer-heading"
        title="Not sure which of those you need?"
      />
      <SectionCopy>
        Start with a short production-readiness audit: what’s shippable, what’s
        theater, and the shortest path to something users can trust.
      </SectionCopy>
      <SectionCopy>
        Most engagements grow out of that — into a sprint, an AI hardening pass,
        or ongoing fractional ownership.
      </SectionCopy>
      <ContactCtaLink
        href={auditInquiryHref}
        title="Book a production-readiness audit"
      >
        Book a production-readiness audit
      </ContactCtaLink>
    </Section>
  );
}
