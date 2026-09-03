import { AboutIdentity } from "@/components/about-identity";
import { ProfileLinks } from "@/components/profile-links";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { expertise } from "@/lib/content";
import { site } from "@/lib/site";
import { ReactNode } from "react";

interface AboutGiorgiProps {
  title: string | ReactNode;
  eyebrow?: string;
  headingAs?: "h1" | "h2";
  description: string;
  showMarketplaceCredit?: boolean;
}

export function AboutGiorgi({
  title,
  eyebrow,
  headingAs,
  description,
  showMarketplaceCredit = false,
}: AboutGiorgiProps) {
  return (
    <Section id="about" labelledBy="about-heading">
      <SectionHeader
        eyebrow={eyebrow}
        headingId="about-heading"
        headingAs={headingAs}
        title={title}
      />
      <div className="grid gap-3 md:grid-cols-[28rem_1fr]">
        <AboutIdentity />
        <div className="flex flex-col gap-2 text-md leading-[1.55] text-muted">
          <p>
            I’m a senior software and AI engineer with more than a decade shipping production systems — AWS serverless, TypeScript, and the product surface around them. I started Mdivani Agency so founders could work with me directly, then scale delivery without changing who owns the architecture.
          </p>
          <p>
            {description}
          </p>
          <ul className="flex list-none flex-wrap gap-1">
            {expertise.map((item) => (
              <li
                key={item}
                className="rounded-full border border-subtle px-1.5 py-[0.6rem] text-xs text-primary"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <ProfileLinks className="col-span-full" />
        {showMarketplaceCredit ? (
          <p className="col-span-full text-xs text-muted">
            Vetted by{" "}
            <a
              className="text-secondary underline underline-offset-[0.3em]"
              href={site.toptalProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Giorgi Mdivani on Toptal"
            >
              Toptal
            </a>{" "}
            for its top 3% network.
          </p>
        ) : null}
      </div>
    </Section>
  );
}
