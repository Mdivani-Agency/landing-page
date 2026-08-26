import { AboutGiorgi } from "@/components/sections/about-giorgi";
import { FinalCta } from "@/components/sections/final-cta";
import { Founders } from "@/components/sections/founders";
import { Geography } from "@/components/sections/geography";
import { Greenfield } from "@/components/sections/greenfield";
import { Hero } from "@/components/sections/hero";
import { HowIWork } from "@/components/sections/how-i-work";
import { SelectedWork } from "@/components/sections/selected-work";
import { StudioModel } from "@/components/sections/studio-model";
import { Testimonials } from "@/components/sections/testimonials";
import { WhatIBuild } from "@/components/sections/what-i-build";

export function HomeSections() {
  return (
    <>
      <Hero />
      <WhatIBuild />
      <Greenfield />
      <SelectedWork />
      <AboutGiorgi />
      <StudioModel />
      <HowIWork />
      <Testimonials />
      <Founders />
      <Geography />
      <FinalCta />
    </>
  );
}
