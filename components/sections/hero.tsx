import Link from "next/link";
import { ConversationButton } from "@/components/conversation-button";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section id="home" className="hero-section" aria-labelledby="hero-heading">
      <p className="eyebrow">
        {site.personName} · {site.personRole}
      </p>
      <h1 id="hero-heading" className="display">
        Build your AI product from idea to production.
      </h1>
      <p className="lede">
        I’m Giorgi Mdivani, a senior software engineer helping founders turn
        ambitious ideas into production-ready software and AI products. You work
        with me. I bring the team when needed.
      </p>
      <div className="hero-actions">
        <ConversationButton>Let’s talk about your product</ConversationButton>
        <Link href="/work" className="btn-ghost" title="See selected work">
          See my work
        </Link>
      </div>
      <p className="hero-meta">
        Based in Georgia. Working with founders across the UK, US, and
        internationally.
      </p>
    </section>
  );
}
