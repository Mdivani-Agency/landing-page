import { Card, CardText, CardTitle } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { TextLink } from "@/components/text-link";
import { capabilities } from "@/lib/content";

export function WhatIBuild() {
  return (
    <Section id="build" labelledBy="build-heading">
      <SectionHeader
        eyebrow="What I build"
        headingId="build-heading"
        title={<>One engagement, <br /> not three service lines.</>}
        copy="A first build needs AI that holds up with real users, a product around it that ships, and an architecture underneath that still makes sense later. That is one piece of work, and there is nothing here you have to choose between."
      />
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
        {capabilities.map((capability) => (
          <Card
            key={capability.id}
            variant={capability.featured ? "featured" : "default"}
            className={
              capability.featured ? "md:col-span-full lg:col-auto" : undefined
            }
          >
            <Eyebrow variant="card">{capability.eyebrow}</Eyebrow>
            <CardTitle>{capability.title}</CardTitle>
            <CardText>{capability.summary}</CardText>
            <ul className="my-2.5 flex flex-col gap-1 text-sm">
              {capability.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <TextLink href={capability.href}>
              Explore {capability.title}
            </TextLink>
          </Card>
        ))}
      </div>
    </Section>
  );
}
