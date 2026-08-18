import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { WhyChooseUs } from "@/components/sections/why-choose-us";

export function HomeSections() {
  return (
    <>
      <Hero />
      <Services />
      <section id="process" className="flex flex-col gap-8 2xl:gap-15">
        <WhyChooseUs />
        <Process />
      </section>
      <Contact />
    </>
  );
}
