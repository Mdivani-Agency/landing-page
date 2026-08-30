import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";

export function Geography() {
  return (
    <Section id="location" labelledBy="location-heading">
      <SectionHeader
        eyebrow="Where"
        headingId="location-heading"
        title="Based in Georgia. Working with founders across the UK, US, and internationally."
        copy="Remote-first is the default. UK startups are the primary market; the US is a close second. Time zones, English, and production AWS are already how the work happens."
      />
    </Section>
  );
}
