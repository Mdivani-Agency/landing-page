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
    <section
      id="greenfield"
      className="flex flex-col gap-1.5"
      aria-labelledby="greenfield-heading"
    >
      <header className="flex flex-col gap-1.5">
        <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
          Starting from zero
        </p>
        <h2
          id="greenfield-heading"
          className="max-w-[22ch] font-serif text-heading"
        >
          Starting with an idea, not a codebase?
        </h2>
        <p className="max-w-[62rem] text-md leading-[1.55] text-muted">
          Most founders I work with do not have an existing team or a legacy
          system to wrap. The job is to go from a sharp idea to a product in
          production — without a large outsourced team in the middle.
        </p>
      </header>
      <ol className="grid list-none gap-2 md:grid-cols-3 lg:grid-cols-5">
        {stages.map((stage, index) => (
          <li
            key={stage}
            className="flex items-start gap-2 border-t border-subtle pt-2"
          >
            <span className="min-w-4 text-xs tracking-label text-secondary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{stage}</span>
          </li>
        ))}
      </ol>
      <p>
        <Link
          href="/startup-development"
          className="inline-flex items-center justify-center text-sm leading-[1.2] text-secondary underline underline-offset-[0.3em]"
        >
          How greenfield engagements work
        </Link>
      </p>
    </section>
  );
}
