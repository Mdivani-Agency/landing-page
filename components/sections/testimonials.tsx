import { TestimonialsRotator } from "@/components/testimonials-rotator";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="band"
      aria-labelledby="testimonials-heading"
    >
      <header className="band-header">
        <p className="eyebrow">Testimonials</p>
        <h2 id="testimonials-heading" className="section-title">
          What collaborators say after shipping with Giorgi.
        </h2>
        <p className="band-copy">
          Published recommendations from people who built with him — one quote
          at a time.
        </p>
      </header>
      <TestimonialsRotator testimonials={testimonials} />
    </section>
  );
}
