import { AboutIdentity } from "@/components/about-identity";
import { ProfileLinks } from "@/components/profile-links";
import { stack } from "@/lib/content";

interface AboutGiorgiProps {
  title: string;
  eyebrow?: string;
}

export function AboutGiorgi({ title, eyebrow }: AboutGiorgiProps) {
  return (
    <section id="about" className="band" aria-labelledby="about-heading">
      <header className="band-header">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id="about-heading" className="section-title">
          {title}
        </h2>
      </header>
      <div className="about-grid">
        <AboutIdentity />
        <div className="about-copy">
          <p>
            I’m a senior software and AI engineer with more than a decade
            shipping production systems — AWS serverless, TypeScript, and the
            product surface around them. I started Mdivani Agency so founders
            could work with me directly, then scale delivery without changing
            who owns the architecture.
          </p>
          <p>
            Typical background on a call: greenfield SaaS, an AI feature that
            has to survive real users, or a first cloud architecture that will
            not need a rewrite in six months.
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
  );
}
