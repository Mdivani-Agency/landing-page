import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { TestimonialsRotator } from "@/components/testimonials-rotator";
import { testimonials } from "@/lib/content";

export function Testimonials() {
  return (
    <Section id="testimonials" labelledBy="testimonials-heading">
      <SectionHeader
        eyebrow="Testimonials"
        headingId="testimonials-heading"
        title="What collaborators say after shipping with Giorgi."
        copy="Published recommendations from people who built with him."
      />
      <TestimonialsRotator testimonials={testimonials} />
    </Section>
  );
}
