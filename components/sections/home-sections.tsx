import { AboutGiorgi } from "@/components/sections/about-giorgi";
import { FinalCta } from "@/components/sections/final-cta";
import { Founders } from "@/components/sections/founders";
import { Hero } from "@/components/sections/hero";
import { StudioModel } from "@/components/sections/studio-model";
import { Testimonials } from "@/components/sections/testimonials";
import { WhatIBuild } from "@/components/sections/what-i-build";
import { profileDescriptions } from "@/lib/content";

export function HomeSections() {
  return (
    <>
      <Hero />
      <AboutGiorgi eyebrow="Work with Giorgi" title="You hire the engineer, not a sales process." description={profileDescriptions.primary} />
      <Testimonials />
      <WhatIBuild />
      <StudioModel />
      <Founders />
      <FinalCta />
    </>
  );
}
