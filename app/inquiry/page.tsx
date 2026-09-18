import { ContactForm } from "@/components/contact-form";
import { PageIntro } from "@/components/page-intro";
import { Section } from "@/components/section";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Tell Giorgi about your product — project type, timeline, and what you want to build. Inquiries get a reply within 1–2 business days.",
  path: "/inquiry",
});

export default function InquiryPage() {
  return (
    <article>
      <PageIntro
        eyebrow="Contact"
        title="Tell me about your project."
        lede="Share a bit of context and I will reply within 1–2 business days. Prefer a live conversation? Book a call from the header."
        showConversationButton={false}
      />
      <Section
        id="audit"
        labelledBy="contact-form-heading"
        className="max-w-[72rem]"
      >
        <h2 id="contact-form-heading" className="sr-only">
          Project inquiry
        </h2>
        <ContactForm />
      </Section>
    </article>
  );
}
