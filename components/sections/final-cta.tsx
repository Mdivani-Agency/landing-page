import { ConversationButton } from "@/components/conversation-button";

export function FinalCta() {
  return (
    <section id="talk" className="band cta-band" aria-labelledby="cta-heading">
      <p className="eyebrow">Next</p>
      <h2 id="cta-heading" className="section-title">
        Tell me what you’re building.
      </h2>
      <p className="band-copy">
        A conversation, not a quote form. Bring the idea, the constraint, and
        the date you want something in users’ hands.
      </p>
      <ConversationButton>Let’s talk about your product</ConversationButton>
    </section>
  );
}
