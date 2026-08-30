import { PageIntro } from "@/components/page-intro";
import { capabilities } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";
import { HowIWork } from "@/components/sections/how-i-work";
import { Greenfield } from "@/components/sections/greenfield";
import { WhatIBuild } from "@/components/sections/what-i-build";

const capability = capabilities[0];

export const metadata = createPageMetadata({
  title: "AI Product Development Process",
  description:
    "How Giorgi Mdivani works with founders to build AI products in production. Product first, reliability next.",
  path: "/how-i-work",
});

export default function AiEngineeringPage() {
  return (
    <article className="space-y-16 divide-y divide-gray-100">
      <PageIntro
        eyebrow="How I Work"
        title="Product first, reliability next."
        lede="I design and ship LLM features, agents, and knowledge systems for founders who need them in production — evaluated, observable, and wired into the rest of the stack."
      />
      <section
        className="flex flex-col gap-1.5 space-y-16"
        aria-labelledby="ai-how-heading"
      >
        <HowIWork />
        <Greenfield />
        <WhatIBuild />
      </section>
    </article>
  );
}
