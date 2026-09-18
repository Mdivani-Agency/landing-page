import Link from "next/link";
import { LinkedInIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { MailLink } from "@/components/mail-link";
import { footerLinks, legalLinks, site, socialLinks } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto w-full max-w-site border-t border-subtle px-2 pt-5 pb-4">
      <div className="flex flex-col md:flex-row md:justify-between mb-10 gap-6">
        <section className="flex flex-col gap-2 max-w-md">
          <Logo />
          <p className="text-sm text-muted">
            {site.personName} — senior software ownership for founders.
            Scalable when the product needs a team.
          </p>
          <MailLink />
        </section>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:ml-auto">
          <div className="flex flex-col items-start">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                title={link.title}
                className="inline-flex items-center gap-1 text-md font-regular"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-start">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                title={link.title}
                className="inline-flex items-center gap-1 text-md font-regular"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon className="size-2 shrink-0" />
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
      <div className="flex flex-col md:flex-row gap-2 justify-between mb-4">
        <div className="flex items-center gap-4">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              title={link.title}
              className="text-xs font-regular"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <span className="text-xs font-regular">
          © {year} Mdivani Agency. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
