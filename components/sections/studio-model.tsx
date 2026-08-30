export function StudioModel() {
  return (
    <section
      id="studio"
      className="flex flex-col gap-1.5"
      aria-labelledby="studio-heading"
    >
      <header className="flex flex-col gap-1.5">
        <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
          The studio
        </p>
        <h2 id="studio-heading" className="max-w-[22ch] font-serif text-heading">
          Senior-led. Scalable when needed.
        </h2>
        <p className="max-w-[62rem] text-md leading-[1.55] text-muted">
          Mdivani Agency is the studio behind the work, not a traditional
          development shop. I stay the technical contact. When a product needs
          more than one senior engineer, I bring trusted people in — without
          inserting account managers between you and the build.
        </p>
      </header>
      <div className="grid gap-2 md:grid-cols-2">
        <article className="rounded-card border border-subtle bg-card p-3">
          <h3 className="mb-1.5 font-serif text-title font-medium">
            You work with me
          </h3>
          <p className="text-sm leading-4 text-muted">
            Discovery, architecture, and the critical path are mine. That is
            the point: a founder gets a senior partner, not a relay of PMs and
            layered developers.
          </p>
        </article>
        <article className="rounded-card border border-subtle bg-card p-3">
          <h3 className="mb-1.5 font-serif text-title font-medium">
            The agency scales the bench
          </h3>
          <p className="text-sm leading-4 text-muted">
            Extra engineers and specialists join when the scope needs them.
            I remain accountable for quality, architecture, and what ships.
          </p>
        </article>
      </div>
    </section>
  );
}
