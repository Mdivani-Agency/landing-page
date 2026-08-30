const reasons = [
  {
    title: "A first product, not a staff-aug bench",
    body: "Founders who need someone who can sit in the problem, choose the architecture, and write the first production code.",
  },
  {
    title: "AI that has to ship",
    body: "Agents, RAG, and document workflows that are evaluated, observable, and wired into a real product — not a slide.",
  },
  {
    title: "A senior partner who can grow a team",
    body: "Start with Giorgi. Add Mdivani Agency engineers when the roadmap is bigger than one person should carry.",
  },
] as const;

export function Founders() {
  return (
    <section
      id="founders"
      className="flex flex-col gap-1.5"
      aria-labelledby="founders-heading"
    >
      <header className="flex flex-col gap-1.5">
        <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
          Who this is for
        </p>
        <h2
          id="founders-heading"
          className="max-w-[22ch] font-serif text-heading"
        >
          Startup founders building something new.
        </h2>
        <p className="max-w-[62rem] text-md leading-[1.55] text-muted">
          This is the work people actually book.
        </p>
      </header>
      <div className="grid gap-2 md:grid-cols-3">
        {reasons.map((reason) => (
          <article
            key={reason.title}
            className="rounded-card border border-subtle bg-card p-3"
          >
            <h3 className="mb-1.5 font-serif text-title font-medium">
              {reason.title}
            </h3>
            <p className="text-sm leading-4 text-muted">{reason.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
