import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { ContactCtaLink } from "@/components/conversation-button";
import { Eyebrow } from "@/components/eyebrow";
import { selectedWork } from "@/lib/content";
import { site } from "@/lib/site";

const productionWork = selectedWork.map((item) => item.name).join(" · ");

export function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-[calc(100vh-12rem)] flex-col pt-5"
      aria-labelledby="hero-heading"
    >
      <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <Eyebrow>
            {site.personName} · {site.personRole}
          </Eyebrow>
          <h1 id="hero-heading" className="max-w-[18ch] font-serif text-display">
            Build your AI product from idea to production.
          </h1>
          <p className="mt-3 max-w-[62rem] text-md leading-[1.55] text-muted">
            Founders hire me to take an AI product from idea to production. You
            work with me. I bring people when the build needs more than one
            senior.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <ContactCtaLink>Let’s talk about your product</ContactCtaLink>
            <Link
              href="/work"
              className="inline-flex min-h-6 items-center justify-center rounded-full border border-subtle bg-transparent px-3 text-sm leading-[1.2] text-primary no-underline hover:opacity-[0.86]"
              title="See selected work"
            >
              See my work
            </Link>
          </div>
        </div>
        <figure className="flex flex-col gap-2 rounded-card border border-subtle bg-[linear-gradient(180deg,rgba(159,212,200,0.16),rgba(8,9,11,0.2))] p-3">
          <Avatar
            src="/assets/images/giorgi.jpg"
            alt={site.personName}
            fallback={site.personName}
            priority
          />
          <figcaption className="text-xs text-muted">
            {site.personName}
            <br />
            {site.personRole}
            <span className="mt-1 block text-secondary">
              In production: {productionWork}
            </span>
          </figcaption>
        </figure>
      </div>
      <p className="mt-auto pt-[6rem] text-xs text-muted">
        Based in Georgia. Working with founders across the UK, US, and
        internationally.
      </p>
    </section>
  );
}
