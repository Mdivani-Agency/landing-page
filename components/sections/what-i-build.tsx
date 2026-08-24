import { capabilities } from "@/lib/content";

export function WhatIBuild() {
  return (
    <section id="build" className="band" aria-labelledby="build-heading">
      <header className="band-header">
        <p className="eyebrow">What I build</p>
        <h2 id="build-heading" className="section-title">
          AI first. Product and architecture beside it.
        </h2>
        <p className="band-copy">
          AI engineering is the sharpest edge. The same engagement can still
          cover the product, the cloud, and the first team around it.
        </p>
      </header>
      <div className="capability-grid">
        {capabilities.map((capability) => (
          <article
            key={capability.id}
            className={`capability-card${capability.featured ? " capability-card-featured" : ""}`}
          >
            <p className="eyebrow">{capability.eyebrow}</p>
            <h3>{capability.title}</h3>
            <p className="capability-summary">{capability.summary}</p>
            <ul>
              {capability.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a href={capability.href} className="text-link">
              Explore {capability.title}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
