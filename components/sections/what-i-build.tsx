import {
  Card,
  CardFooter,
  CardText,
  CardTitle,
  cardSubgrid,
} from "@/components/card";
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
        title={<>AI first. <br /> Product and architecture beside it.</>}
        copy="AI engineering is the sharpest edge. The same engagement can still cover the product, the cloud, and the first team around it."
      />
      {/* Five row tracks per band feed `cardSubgrid`, so every card in a band
          aligns row for row. The body track absorbs the slack left by shorter
          lists, which keeps the footers on a shared baseline. */}
      <div className="grid gap-2 md:grid-cols-2 md:grid-rows-[repeat(2,auto_auto_auto_1fr_auto)] lg:grid-cols-[1.2fr_1fr_1fr] lg:grid-rows-[auto_auto_auto_1fr_auto]">
        {capabilities.map((capability) => (
          <Card
            key={capability.id}
            variant={capability.featured ? "featured" : "default"}
            className={[
              cardSubgrid,
              capability.featured ? "md:col-span-full lg:col-auto" : null,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Eyebrow variant="card">{capability.eyebrow}</Eyebrow>
            <CardTitle>{capability.title}</CardTitle>
            <CardText>{capability.summary}</CardText>
            <ul className="my-2.5 flex flex-col gap-1 text-sm">
              {capability.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <CardFooter>
              <TextLink href={capability.href}>
                Explore {capability.title}
              </TextLink>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Section>
  );
}
