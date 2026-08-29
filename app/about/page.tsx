import type { Metadata } from "next";
import { AboutGiorgi } from "@/components/sections/about-giorgi";
import { Testimonials } from "@/components/sections/testimonials";

export const metadata: Metadata = {
  title: "About Giorgi Mdivani",
  description:
    "Giorgi Mdivani is Founder and Lead AI Engineer at Mdivani Agency — a senior engineer for founders building new software and AI products.",
};

export default function AboutPage() {
  return (
    <section className="space-y-16">
      <AboutGiorgi title="Giorgi Mdivani, Founder and Lead AI Engineer at Mdivani Agency." />
      <Testimonials />
    </section>
  );
}
