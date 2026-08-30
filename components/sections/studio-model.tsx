import { Card, CardText, CardTitle } from "@/components/card";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";

export function StudioModel() {
  return (
    <Section id="studio" labelledBy="studio-heading">
      <SectionHeader
        eyebrow="The studio"
        headingId="studio-heading"
        title="Senior-led. Scalable when needed."
        copy="Mdivani Agency is the studio behind the work, not a traditional development shop. I stay the technical contact. When a product needs more than one senior engineer, I bring trusted people in — without inserting account managers between you and the build."
      />
      <div className="grid gap-2 md:grid-cols-2">
        <Card>
          <CardTitle>You work with me</CardTitle>
          <CardText>
            Discovery, architecture, and the critical path are mine. That is
            the point: a founder gets a senior partner, not a relay of PMs and
            layered developers.
          </CardText>
        </Card>
        <Card>
          <CardTitle>The agency scales the bench</CardTitle>
          <CardText>
            Extra engineers and specialists join when the scope needs them.
            I remain accountable for quality, architecture, and what ships.
          </CardText>
        </Card>
      </div>
    </Section>
  );
}
