import { AboutGiorgi } from "@/components/sections/about-giorgi";
import { CaseOutcomes } from "@/components/sections/case-outcomes";
import { FinalCta } from "@/components/sections/final-cta";
import { Founders } from "@/components/sections/founders";
import { Hero } from "@/components/sections/hero";
import { StudioModel } from "@/components/sections/studio-model";
import { WhatIBuild } from "@/components/sections/what-i-build";
import { profileDescriptions } from "@/lib/content";

export function HomeSections() {
  return (
    <>
      <Hero />
      <Founders />
      <WhatIBuild />
      <StudioModel />
      <CaseOutcomes />
      <AboutGiorgi eyebrow="Work with Giorgi" title={<>You hire the engineer, not a sales <br /> process.</>} description={profileDescriptions.primary} showPortrait={false} />
      <FinalCta />
    </>
  );
}
