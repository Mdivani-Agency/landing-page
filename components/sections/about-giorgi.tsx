import { AboutIdentity } from "@/components/about-identity";
import { ProfileLinks } from "@/components/profile-links";
import { expertise } from "@/lib/content";

interface AboutGiorgiProps {
  title: string;
  eyebrow?: string;
  description: string;
}

export function AboutGiorgi({ title, eyebrow, description }: AboutGiorgiProps) {
  return (
    <section
      id="about"
      className="flex flex-col gap-1.5"
      aria-labelledby="about-heading"
    >
      <header className="flex flex-col gap-1.5">
        {eyebrow && (
          <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
            {eyebrow}
          </p>
        )}
        <h2 id="about-heading" className="max-w-[22ch] font-serif text-heading">
          {title}
        </h2>
      </header>
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
      </div>
    </section>
  );
}
