import Link from "next/link";
import { capabilities } from "@/lib/content";

export function WhatIBuild() {
  return (
    <section
      id="build"
      className="flex flex-col gap-1.5"
      aria-labelledby="build-heading"
    >
      <header className="flex flex-col gap-1.5">
        <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
          What I build
        </p>
        <h2 id="build-heading" className="max-w-[22ch] font-serif text-heading">
          AI first. Product and architecture beside it.
        </h2>
        <p className="max-w-[62rem] text-md leading-[1.55] text-muted">
          AI engineering is the sharpest edge. The same engagement can still
          cover the product, the cloud, and the first team around it.
        </p>
      </header>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
        {capabilities.map((capability) => (
          <article
            key={capability.id}
            className={`rounded-card border bg-card p-3${
              capability.featured
                ? " border-[rgba(159,212,200,0.35)] md:col-span-full lg:col-auto"
                : " border-subtle"
            }`}
          >
            <p className="mb-1.5 text-sm uppercase leading-4 tracking-caps text-muted">
              {capability.eyebrow}
            </p>
            <h3 className="mb-1.5 font-serif text-title font-medium">
              {capability.title}
            </h3>
            <p className="text-sm leading-4 text-muted">{capability.summary}</p>
            <ul className="my-2.5 flex flex-col gap-1 text-sm">
              {capability.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link
              href={capability.href}
              className="inline-flex items-center justify-center text-sm leading-[1.2] text-secondary underline underline-offset-[0.3em]"
            >
              Explore {capability.title}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
