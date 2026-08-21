import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { capabilities } from "@/lib/content";

const capability = capabilities[0];

export const metadata: Metadata = {
  title: "AI Engineering for Startups",
  description:
    "AI agents, RAG, document intelligence, and LLM product features built by Giorgi Mdivani for founders shipping real software.",
};

export default function AiEngineeringPage() {
  return (
    <article>
      <PageIntro
        eyebrow="AI Engineering"
        title="AI that belongs in the product, not the pitch deck."
        lede="I design and ship LLM features, agents, and knowledge systems for founders who need them in production — evaluated, observable, and wired into the rest of the stack."
      />
      <section className="band" aria-labelledby="ai-list-heading">
        <h2 id="ai-list-heading" className="section-title">
          What this covers
        </h2>
        <ul className="detail-list">
          {capability.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="band" aria-labelledby="ai-how-heading">
        <h2 id="ai-how-heading" className="section-title">
          How I approach AI work
        </h2>
        <div className="split-cards">
          <article className="capability-card">
            <h3>Product first</h3>
            <p>
              The model is not the product. We start from the user job, the
              data you actually have, and the failure mode you cannot afford.
            </p>
          </article>
          <article className="capability-card">
            <h3>Reliability next</h3>
            <p>
              Evaluation, fallbacks, and traces so an agentic workflow can be
              operated — not only demoed once.
            </p>
          </article>
        </div>
      </section>
    </article>
  );
}
