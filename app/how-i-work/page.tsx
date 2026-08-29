import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { capabilities } from "@/lib/content";
import { HowIWork } from "@/components/sections/how-i-work";
import { Greenfield } from "@/components/sections/greenfield";
import { WhatIBuild } from "@/components/sections/what-i-build";

const capability = capabilities[0];

export const metadata: Metadata = {
  title: "How I Work",
  description:
    "How Giorgi Mdivani works with founders to build AI products in production. Product first, reliability next.",
};

export default function AiEngineeringPage() {
  return (
    <article className="space-y-16 divide-y divide-gray-100">
      <PageIntro
        eyebrow="How I Work"
        title="Product first, reliability next."
        lede="I design and ship LLM features, agents, and knowledge systems for founders who need them in production — evaluated, observable, and wired into the rest of the stack."
      />
      <section className="band space-y-16" aria-labelledby="ai-how-heading">
        <HowIWork />
        <Greenfield />
        <WhatIBuild />
      </section>
    </article>
  );
}
