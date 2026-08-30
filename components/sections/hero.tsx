import Link from "next/link";
import { ConversationButton } from "@/components/conversation-button";
import { Eyebrow } from "@/components/eyebrow";
import { site } from "@/lib/site";

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
      <h1 id="hero-heading" className="max-w-[18ch] font-serif text-display">
        Build your AI product from idea to production.
      </h1>
      <p className="mt-3 max-w-[62rem] text-md leading-[1.55] text-muted">
        I’m Giorgi Mdivani, a senior software engineer helping founders turn
        ambitious ideas into production-ready software and AI products. You work
        with me. I bring the team when needed.
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <ConversationButton>Let’s talk about your product</ConversationButton>
        <Link
          href="/work"
          className="inline-flex min-h-6 items-center justify-center rounded-full border border-subtle bg-transparent px-3 text-sm leading-[1.2] text-primary no-underline hover:opacity-[0.86]"
          title="See selected work"
        >
          See my work
        </Link>
      </div>
      <p className="mt-auto pt-[6rem] text-xs text-muted">
        Based in Georgia. Working with founders across the UK, US, and
        internationally.
      </p>
    </section>
  );
}
