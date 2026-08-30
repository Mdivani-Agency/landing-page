import { AboutGiorgi } from "@/components/sections/about-giorgi";
import { Testimonials } from "@/components/sections/testimonials";
import { profileDescriptions } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Giorgi Mdivani — Toptal & Upwork Software Engineer",
  description:
    "Meet Giorgi Mdivani, a Toptal-vetted software engineer in its top 3% talent network and an experienced Upwork developer specializing in AI, AWS, and product engineering.",
  socialDescription:
    "Toptal-vetted and available through Upwork, Giorgi helps founders architect and ship production-ready AI, cloud, web, and mobile products.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className="space-y-16">
      <AboutGiorgi
        title="Giorgi Mdivani, Founder and Lead AI Engineer at Mdivani Agency."
        description={profileDescriptions.secondary}
      />
      <Testimonials />
    </section>
  );
}
