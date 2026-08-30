import { ContactForm } from "@/components/contact-form";
import { PageIntro } from "@/components/page-intro";
import { Section } from "@/components/section";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Tell Giorgi about your product — project type, timeline, and what you want to build. Inquiries get a reply within 1–2 business days.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <article>
      <PageIntro
        eyebrow="Contact"
        title="Tell me about your project."
        lede="Share a bit of context and I will reply within 1–2 business days. If a call is a better fit, you can still book time from any other page."
        showConversationButton={false}
      />
      <Section labelledBy="contact-form-heading" className="max-w-[72rem]">
        <h2 id="contact-form-heading" className="sr-only">
          Project inquiry
        </h2>
        <ContactForm />
      </Section>
    </article>
  );
}
