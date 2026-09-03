import { LinkedInIcon } from "@/components/icons";
import type { Testimonial } from "@/lib/content";

type PullQuoteProps = {
  testimonial: Testimonial;
};

export function PullQuote({ testimonial }: PullQuoteProps) {
  if (!testimonial.pullQuote) {
    return null;
  }

  return (
    <figure className="mt-1 flex max-w-[72rem] flex-col gap-1 border-l border-subtle pl-2.5">
      <blockquote className="font-serif text-md leading-[1.55] text-primary">
        “{testimonial.pullQuote}”
      </blockquote>
      <figcaption className="text-xs text-muted">
        <a
          className="inline-flex items-center gap-0.5 text-secondary underline underline-offset-[0.3em]"
          href={testimonial.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${testimonial.author} on LinkedIn`}
        >
          <LinkedInIcon className="size-2 shrink-0" />
          {testimonial.author}
        </a>
        {testimonial.title ? `, ${testimonial.title}` : null}
      </figcaption>
    </figure>
  );
}
