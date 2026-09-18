import { Card, CardText, CardTitle } from "@/components/card";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { namedOutcomes } from "@/lib/content";

export function WhatIBuild() {
  return (
    <Section id="start" labelledBy="start-heading">
      <SectionHeader
        eyebrow="Named outcomes"
        headingId="start-heading"
        title="Three ways founders usually start."
      />
      <div className="grid gap-2 md:grid-cols-3">
        {namedOutcomes.map((outcome) => (
          <Card key={outcome.id}>
            <CardTitle>{outcome.title}</CardTitle>
            <CardText>{outcome.body}</CardText>
          </Card>
        ))}
      </div>
    </Section>
  );
}
