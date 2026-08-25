import Link from "next/link";

const stages = [
  "Idea",
  "Definition",
  "Architecture",
  "Build",
  "Launch",
] as const;

export function Greenfield() {
  return (
    <section id="greenfield" className="band" aria-labelledby="greenfield-heading">
      <header className="band-header">
        <p className="eyebrow">Starting from zero</p>
        <h2 id="greenfield-heading" className="section-title">
          Starting with an idea, not a codebase?
        </h2>
        <p className="band-copy">
          Most founders I work with do not have an existing team or a legacy
          system to wrap. The job is to go from a sharp idea to a product in
          production — without a large outsourced team in the middle.
        </p>
      </header>
      <ol className="stage-row">
        {stages.map((stage, index) => (
          <li key={stage}>
            <span className="stage-index">{String(index + 1).padStart(2, "0")}</span>
            <span>{stage}</span>
          </li>
        ))}
      </ol>
      <p>
        <Link href="/startup-development" className="text-link">
          How greenfield engagements work
        </Link>
      </p>
    </section>
  );
}
