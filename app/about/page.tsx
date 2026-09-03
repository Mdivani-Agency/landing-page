import { AboutGiorgi } from "@/components/sections/about-giorgi";
import { Testimonials } from "@/components/sections/testimonials";
import { profileDescriptions } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Giorgi Mdivani — founder & lead AI engineer",
  description:
    "Giorgi Mdivani works directly with founders on AI and product engineering: the architecture, the first production build, and the team that joins when the roadmap outgrows one senior.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className="space-y-16">
      <AboutGiorgi
        headingAs="h1"
        title={<>Giorgi Mdivani, <br /> Founder and Lead AI Engineer</>}
        description={profileDescriptions.secondary}
        showToptalBadge
      />
      <Testimonials />
    </section>
  );
}
