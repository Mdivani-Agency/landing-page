import { processSteps } from "@/lib/content";

export function HowIWork() {
  return (
    <section id="process" className="band" aria-labelledby="process-heading">
      <header className="band-header">
        <p className="eyebrow">How I work</p>
        <h2 id="process-heading" className="section-title">
          Understand → Define → Architect → Build → Launch.
        </h2>
      </header>
      <ol className="process-list">
        {processSteps.map((step, index) => (
          <li key={step.title}>
            <span className="stage-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
