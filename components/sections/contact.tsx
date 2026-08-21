import { MailLink } from "@/components/mail-link";
import { PrimaryButton } from "@/components/primary-button";

export function Contact() {
  return (
    <section
      id="contact"
      className="flex flex-col items-center justify-center gap-4 mb-8 md:min-h-screen"
    >
      <h2 className="text-lg md:text-xl leading-2 font-semibold text-center">
        Looking for a Trusted Software Partner? Let&apos;s Build Something Great
        Together.
      </h2>
      <p className="text-md text-center md:text-left lg:text-title">
        Let&apos;s connect! We will respond promptly to start building something
        great together
      </p>
      <div className="flex flex-col-reverse justify-center items-center gap-4 md:flex-row">
        <PrimaryButton>Schedule Call Now</PrimaryButton>
        <MailLink />
      </div>
    </section>
  );
}
