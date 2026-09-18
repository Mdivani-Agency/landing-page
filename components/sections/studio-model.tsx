import { Card, CardText, CardTitle } from "@/components/card";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";

export function StudioModel() {
  return (
    <Section id="studio" labelledBy="studio-heading">
      <SectionHeader
        eyebrow="How it works"
        headingId="studio-heading"
        title="One owner on the critical path."
        copy="A first build usually needs product that ships, AI that holds up with real users, and architecture that still makes sense in six months. That is one piece of work — not three packages you have to assemble."
      />
      <div className="grid gap-2 md:grid-cols-2">
        <Card>
          <CardTitle>You work with me</CardTitle>
          <CardText>
            Discovery, architecture, and the critical path stay with Giorgi.
          </CardText>
        </Card>
        <Card>
          <CardTitle>The studio scales when needed</CardTitle>
          <CardText>
            Extra engineers join for scope that needs them. No account-manager
            layer between you and the build.
          </CardText>
        </Card>
      </div>
    </Section>
  );
}
