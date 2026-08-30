import { processSteps } from "@/lib/content";

export function HowIWork() {
  return (
    <section
      id="process"
      className="flex flex-col gap-1.5"
      aria-labelledby="process-heading"
    >
      <header className="flex flex-col gap-1.5">
        <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
          How I work
        </p>
        <h2 id="process-heading" className="max-w-[22ch] font-serif text-heading">
          Understand → Define → Architect → Build → Launch.
        </h2>
      </header>
      <ol className="grid list-none gap-2">
        {processSteps.map((step, index) => (
          <li
            key={step.title}
            className="flex items-start gap-2 border-t border-subtle pt-2"
          >
            <span className="min-w-4 text-xs tracking-label text-secondary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="mb-1.5 font-serif text-title font-medium">
                {step.title}
              </h3>
              <p className="text-sm leading-4 text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
