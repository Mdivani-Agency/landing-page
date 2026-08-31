import { PageIntro } from "@/components/page-intro";
import { Greenfield } from "@/components/sections/greenfield";
import { HowIWork } from "@/components/sections/how-i-work";
import { WhatIBuild } from "@/components/sections/what-i-build";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "AI Product Development Process",
  description:
    "How Giorgi Mdivani works with founders to build AI products in production. Product first, reliability next.",
  path: "/how-i-work",
});

export default function HowIWorkPage() {
  return (
    <article className="space-y-16">
      <PageIntro
        eyebrow="How I Work"
        title="Product first, reliability next."
        lede="I design and ship LLM features, agents, and knowledge systems for founders who need them in production — evaluated, observable, and wired into the rest of the stack."
      />
      <div className="space-y-16">
        <WhatIBuild />
        <Greenfield />
        <HowIWork />
      </div>
    </article>
  );
}
