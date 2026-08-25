import type { Metadata } from "next";
import { AboutIdentity } from "@/components/about-identity";
import { PageIntro } from "@/components/page-intro";
import { ProfileLinks } from "@/components/profile-links";
import { stack } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Giorgi Mdivani",
  description:
    "Giorgi Mdivani is Founder and Lead AI Engineer at Mdivani Agency — a senior engineer for founders building new software and AI products.",
};

export default function AboutPage() {
  return (
    <article>
      <PageIntro
        eyebrow="About"
        title={`${site.personName}, ${site.personRole}.`}
        lede="Clients work with me. Mdivani Agency is the studio that adds engineers when a product outgrows a single senior owner."
      />
      <section className="band" aria-labelledby="about-bio-heading">
        <h2 id="about-bio-heading" className="section-title">
          Background
        </h2>
        <div className="about-grid">
          <AboutIdentity />
          <div className="about-copy">
            <p>
              I am a full-stack architect focused on AWS serverless systems,
              TypeScript, and AI-backed product features. I have spent more than
              a decade in production software — from telecom systems to hospital
              apps, aviation compliance, and investment tooling. I founded
              Mdivani Agency so founders could hire that ownership directly.
            </p>
            <ul className="stack-list">
              {stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ProfileLinks />
          </div>
        </div>
      </section>
    </article>
  );
}
