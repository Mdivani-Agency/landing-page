import { ConversationButton } from "@/components/conversation-button";

export function FinalCta() {
  return (
    <section
      id="talk"
      className="flex flex-col gap-1.5 border-t border-subtle pt-6 pb-3"
      aria-labelledby="cta-heading"
    >
      <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
        Next
      </p>
      <h2 id="cta-heading" className="max-w-[22ch] font-serif text-heading">
        Tell me what you’re building.
      </h2>
      <p className="max-w-[62rem] text-md leading-[1.55] text-muted">
        A conversation, not a quote form. Bring the idea, the constraint, and
        the date you want something in users’ hands.
      </p>
      <ConversationButton>Let’s talk about your product</ConversationButton>
    </section>
  );
}
