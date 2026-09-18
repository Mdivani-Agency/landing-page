import { Card, CardText, CardTitle } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { PullQuote } from "@/components/pull-quote";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { TextLink } from "@/components/text-link";
import { selectedWork, testimonials } from "@/lib/content";

const featuredCases = selectedWork.filter((item) => item.homeOutcome);

// One quote under the cases, from the CTO of the product in the Eolas card.
const leadTestimonial = testimonials.find(
  (testimonial) => testimonial.pullQuote,
);

export function CaseOutcomes() {
  return (
    <Section id="proof" labelledBy="proof-heading">
      <SectionHeader
        eyebrow="Proof"
        headingId="proof-heading"
        title={<>Named products, <br /> in production, with outcomes.</>}
        copy="Proof beats another “senior team” claim."
      />
      <div className="grid gap-2 md:grid-cols-3">
        {featuredCases.map((item) => (
          <Card key={item.slug} className="flex flex-col gap-1.5">
            <Eyebrow variant="card">{item.client}</Eyebrow>
            <CardTitle>{item.title}</CardTitle>
            <CardText>{item.homeOutcome}</CardText>
            <TextLink href={item.href} className="mt-auto self-start">
              Read the {item.name} case
            </TextLink>
          </Card>
        ))}
      </div>
      {leadTestimonial ? <PullQuote testimonial={leadTestimonial} /> : null}
    </Section>
  );
}
