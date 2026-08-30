import { Card, CardText, CardTitle } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { TextLink } from "@/components/text-link";
import { selectedWork } from "@/lib/content";
import Link from "next/link";

export function SelectedWork() {
  return (
    <Section id="work" labelledBy="work-heading">
      <SectionHeader
        eyebrow="Selected work"
        headingId="work-heading"
        title="Products Giorgi has taken into production."
        copy="Public engagements — insurance governance, hospital software, aviation compliance, and investment analytics. Each one needed senior ownership, not a layered agency bench."
      />
      <div className="grid gap-2 md:grid-cols-2">
        {selectedWork.map((item) => (
          <Card key={item.slug}>
            <Eyebrow variant="card">
              {item.client} · {item.role}
            </Eyebrow>
            <CardTitle>
              <Link href={item.href}>{item.title}</Link>
            </CardTitle>
            <CardText>{item.outcome}</CardText>
            <CardText>{item.stack.join(" · ")}</CardText>
          </Card>
        ))}
      </div>
      <TextLink href="/work">All selected work</TextLink>
    </Section>
  );
}
