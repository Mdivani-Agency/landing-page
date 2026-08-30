import { Card, CardText, CardTitle } from "@/components/card";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";

const reasons = [
  {
    title: "A first product, not a staff-aug bench",
    body: "Founders who need someone who can sit in the problem, choose the architecture, and write the first production code.",
  },
  {
    title: "AI that has to ship",
    body: "Agents, RAG, and document workflows that are evaluated, observable, and wired into a real product — not a slide.",
  },
  {
    title: "A senior partner who can grow a team",
    body: "Start with Giorgi. Add Mdivani Agency engineers when the roadmap is bigger than one person should carry.",
  },
] as const;

export function Founders() {
  return (
    <Section id="founders" labelledBy="founders-heading">
      <SectionHeader
        eyebrow="Who this is for"
        headingId="founders-heading"
        title="Startup founders building something new."
        copy="This is the work people actually book."
      />
      <div className="grid gap-2 md:grid-cols-3">
        {reasons.map((reason) => (
          <Card key={reason.title}>
            <CardTitle>{reason.title}</CardTitle>
            <CardText>{reason.body}</CardText>
          </Card>
        ))}
      </div>
    </Section>
  );
}
