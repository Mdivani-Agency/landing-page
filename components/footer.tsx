import Link from "next/link";
import { Logo } from "@/components/logo";
import { MailLink } from "@/components/mail-link";
import { sectionLinks, socialLinks } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-2 lg:px-6 mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between mb-10 gap-6">
        <section className="flex flex-col gap-2">
          <Logo />
          <MailLink />
        </section>
        <nav className="grid grid-cols-2 gap-8 md:ml-auto">
          <div className="flex flex-col items-start">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                title={link.title}
                className="text-md font-regular"
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-start">
            {sectionLinks.map((link) => (
              <a
                key={link.href}
                title={link.title}
                className="text-md font-regular"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
      <div className="flex flex-col md:flex-row gap-2 justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link
            title="privacy policy"
            className="text-xs font-regular"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>
          <Link
            title="terms of service"
            className="text-xs font-regular"
            href="/terms-of-service"
          >
            Terms of Service
          </Link>
        </div>
        <span className="text-xs font-regular">
          © {year} Mdivani Agency. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
