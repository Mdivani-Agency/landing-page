import Link from "next/link";
import { ContactCtaLink } from "@/components/conversation-button";
import { Eyebrow } from "@/components/eyebrow";
import { auditInquiryHref, site } from "@/lib/site";

export function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-[calc(100vh-12rem)] flex-col pt-5"
      aria-labelledby="hero-heading"
    >
      <Eyebrow>
        {site.personName} · {site.personRole}
      </Eyebrow>
      <h1 id="hero-heading" className="max-w-[22ch] font-serif text-display">
        Ship the product. Own the architecture. Skip the staff-aug bench.
      </h1>
      <p className="mt-3 max-w-[62rem] text-md leading-[1.55] text-muted">
        Founders hire me when they need senior software ownership — product,
        architecture, and AI that has to work with real users — without standing
        up a full engineering org first.
      </p>
      <p className="mt-2 max-w-[62rem] text-md leading-[1.55] text-muted">
        You work with me. I bring people only when the critical path needs more
        than one senior.
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <ContactCtaLink>Tell me what you’re shipping</ContactCtaLink>
        <Link
          href={auditInquiryHref}
          className="inline-flex min-h-6 items-center justify-center rounded-full border border-subtle bg-transparent px-3 text-sm leading-[1.2] text-primary no-underline hover:opacity-[0.86]"
          title="Book a production-readiness audit"
        >
          Book a production-readiness audit
        </Link>
      </div>
      <p className="mt-auto pt-[6rem] text-xs text-muted">
        Working with founders across the UK and US.
      </p>
    </section>
  );
}
