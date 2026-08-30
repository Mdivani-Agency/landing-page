export function Geography() {
  return (
    <section
      id="location"
      className="flex flex-col gap-1.5"
      aria-labelledby="location-heading"
    >
      <header className="flex flex-col gap-1.5">
        <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
          Where
        </p>
        <h2
          id="location-heading"
          className="max-w-[22ch] font-serif text-heading"
        >
          Based in Georgia. Working with founders across the UK, US, and
          internationally.
        </h2>
        <p className="max-w-[62rem] text-md leading-[1.55] text-muted">
          Remote-first is the default. UK startups are the primary market; the
          US is a close second. Time zones, English, and production AWS are
          already how the work happens.
        </p>
      </header>
    </section>
  );
}
