import { Card, CardText, CardTitle } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { TextLink } from "@/components/text-link";
import { selectedWork } from "@/lib/content";

const featuredCases = selectedWork.filter((item) => item.homeOutcome);

export function CaseOutcomes() {
  return (
    <Section id="proof" labelledBy="proof-heading">
      <SectionHeader
        eyebrow="Proof"
        headingId="proof-heading"
        title={<>Named products, <br /> in production, with outcomes.</>}
        copy="Outcomes below are from public descriptions of that work — not invented testimonials."
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
    </Section>
  );
}
