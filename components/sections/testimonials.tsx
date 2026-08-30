import { TestimonialsRotator } from "@/components/testimonials-rotator";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="flex flex-col gap-1.5"
      aria-labelledby="testimonials-heading"
    >
      <header className="flex flex-col gap-1.5">
        <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
          Testimonials
        </p>
        <h2
          id="testimonials-heading"
          className="max-w-[22ch] font-serif text-heading"
        >
          What collaborators say after shipping with Giorgi.
        </h2>
        <p className="max-w-[62rem] text-md leading-[1.55] text-muted">
          Published recommendations from people who built with him.
        </p>
      </header>
      <TestimonialsRotator testimonials={testimonials} />
    </section>
  );
}
