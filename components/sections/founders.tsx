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
    <section id="founders" className="band" aria-labelledby="founders-heading">
      <header className="band-header">
        <p className="eyebrow">Who this is for</p>
        <h2 id="founders-heading" className="section-title">
          Startup founders building something new.
        </h2>
        <p className="band-copy">
          This is the work people actually book.
        </p>
      </header>
      <div className="split-cards three">
        {reasons.map((reason) => (
          <article key={reason.title} className="capability-card">
            <h3>{reason.title}</h3>
            <p>{reason.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
