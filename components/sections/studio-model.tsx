export function StudioModel() {
  return (
    <section id="studio" className="band" aria-labelledby="studio-heading">
      <header className="band-header">
        <p className="eyebrow">The studio</p>
        <h2 id="studio-heading" className="section-title">
          Senior-led. Scalable when needed.
        </h2>
        <p className="band-copy">
          Mdivani Agency is the studio behind the work, not a traditional
          development shop. I stay the technical contact. When a product needs
          more than one senior engineer, I bring trusted people in — without
          inserting account managers between you and the build.
        </p>
      </header>
      <div className="split-cards">
        <article className="capability-card">
          <h3>You work with me</h3>
          <p>
            Discovery, architecture, and the critical path are mine. That is
            the point: a founder gets a senior partner, not a relay of PMs and
            layered developers.
          </p>
        </article>
        <article className="capability-card">
          <h3>The agency scales the bench</h3>
          <p>
            Extra engineers and specialists join when the scope needs them.
            I remain accountable for quality, architecture, and what ships.
          </p>
        </article>
      </div>
    </section>
  );
}
