import { site } from "@/lib/site";
import {
  LegalContact,
  LegalDocument,
} from "@/components/legal/legal-document";

export function TermsOfServiceContent() {
  return (
    <LegalDocument>
      <header>
        <h1 className="text-title font-semibold">Terms of Service</h1>
        <p className="text-xs font-medium">
          <strong>Last updated: 1 September 2026</strong>
        </p>
      </header>

      <section>
        <p>
          These Terms of Service (“Terms”) govern your use of{" "}
          <a href={site.url}>{site.url}</a> (including{" "}
          <code>www.mdivani.agency</code>) and any inquiry or call you start
          through the site.
        </p>
        <p>
          The site is operated by <strong>{site.name}</strong>,{" "}
          {site.personName}, {site.address} (“Mdivani”, “we”). Contact:{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <p>
          Paid engineering work is <strong>not</strong> governed only by these
          Terms. A separate written statement of work, proposal, or contract
          (the “Service Agreement”) will apply to that work. If those documents
          conflict with these Terms, the Service Agreement controls for that
          project.
        </p>
      </section>

      <section>
        <h2>1. Who this is for</h2>
        <p>
          The site is a professional studio site for founders and businesses.
          You must be 18 or the age of majority in your jurisdiction. If you use
          the site for a company, you confirm you are authorised to bind that
          company.
        </p>
      </section>

      <section>
        <h2>2. The website, not a hire</h2>
        <p>
          Browsing, sending an inquiry, or booking a call does{" "}
          <strong>not</strong> create an engagement. We may decline or ignore
          inquiries. We reply to genuine inquiries within about 1–2 business
          days, but that is a target, not a contractual SLA.
        </p>
      </section>

      <section>
        <h2>3. Inquiries and calls</h2>
        <p>
          The inquiry form collects name, email, company, project type, budget
          range, timeline, description, and an optional product link, and posts
          them to our <code>/api/contact</code> endpoint. “Schedule a call”
          opens Google Calendar appointment scheduling in an iframe.
        </p>
        <p>
          You agree the information you submit is accurate and that you have the
          right to share it. Do not send secrets, passwords, health data, or
          other people’s personal data unless we have asked for it in writing.
        </p>
        <p>
          How we handle that data is described in our{" "}
          <a href="/privacy-policy">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>4. Services (when we do engage)</h2>
        <p>
          Typical work, once a Service Agreement is signed, includes AI product
          engineering, greenfield SaaS, web and mobile applications, cloud
          architecture, and related technical leadership. Scope, fees, timeline,
          IP, and acceptance live in that agreement — not in marketing copy on
          this site.
        </p>
        <p>
          Website descriptions of past work are from public sources and are not
          warranties that we will achieve the same result for you.
        </p>
      </section>

      <section>
        <h2>5. Fees</h2>
        <p>
          Fees, invoices, expenses, and late-payment terms are set in the
          Service Agreement. Nothing on the site is an offer at a fixed price.
          Budget ranges on the inquiry form are for context only.
        </p>
      </section>

      <section>
        <h2>6. Intellectual property</h2>
        <p>
          <strong>This site.</strong> The site’s design, text, logo, and code
          are owned by {site.name} or our licensors. You may not copy the site
          or scrape it for a competing offering.
        </p>
        <p>
          <strong>Project work.</strong> Ownership of code and materials we
          create for a paid engagement is defined in the Service Agreement.
          Until that agreement says otherwise, we retain our pre-existing tools,
          libraries, and know-how.
        </p>
        <p>
          <strong>Your materials.</strong> You keep IP in materials you send us.
          You grant us a limited licence to use them to evaluate the inquiry
          and, if we work together, to perform the work.
        </p>
      </section>

      <section>
        <h2>7. Confidentiality</h2>
        <p>
          If we discuss a project, each side will keep the other’s non-public
          information confidential and use it only for that discussion or
          engagement, except information that is public, independently
          developed, or required to be disclosed by law. A Service Agreement may
          add a stricter NDA.
        </p>
      </section>

      <section>
        <h2>8. Acceptable use</h2>
        <p>
          Do not misuse the site: no scraping beyond normal browsing, no
          flooding the inquiry form, no malware, and no attempting to break
          authentication or our APIs. We may block traffic that looks like abuse
          (including submissions caught by the form honeypot).
        </p>
      </section>

      <section>
        <h2>9. Third-party services</h2>
        <p>
          The site uses Vercel (hosting and web analytics), Google Analytics 4,
          Sentry (error and performance monitoring), and Google Calendar for
          appointment booking. Toptal, LinkedIn, Upwork, and GitHub links go to
          those sites and are under their terms. We are not responsible for
          third-party sites or the Google booking UI.
        </p>
      </section>

      <section>
        <h2>10. No warranty</h2>
        <p>
          The site is provided “as is”. We do not warrant that it will be
          uninterrupted or error-free. Marketing copy, case studies, and
          testimonials are illustrative. They are not a guarantee of outcome,
          availability, or that we will take your project.
        </p>
      </section>

      <section>
        <h2>11. No liability for site use</h2>
        <p>
          Using this site, sending an inquiry, or booking a call does not create
          any liability for {site.name} or {site.personName}. To the fullest
          extent permitted by law, we are not liable for any damages arising
          from use of the site or from an inquiry or call.
        </p>
        <p>
          Liability under a Service Agreement is whatever that agreement says.
        </p>
        <p>
          Nothing in these Terms limits liability that cannot be limited under
          applicable law (including fraud).
        </p>
      </section>

      <section>
        <h2>12. Indemnity</h2>
        <p>
          You will indemnify {site.name} and {site.personName} against claims
          arising from your misuse of the site or from content you submit,
          except to the extent caused by our wilful misconduct.
        </p>
      </section>

      <section>
        <h2>13. Changes</h2>
        <p>
          We may update these Terms by posting a new version on this page. The
          “Last updated” date will change. Continued use of the site after that
          is acceptance of the new Terms. For an active Service Agreement,
          changes to these website Terms do not rewrite that agreement.
        </p>
      </section>

      <section>
        <h2>14. Governing law</h2>
        <p>
          These Terms are governed by the laws of Georgia (the country), without
          regard to conflict-of-law rules. Courts of Tbilisi, Georgia have
          exclusive jurisdiction, except that we may seek injunctive relief
          anywhere.
        </p>
        <p>
          If you are a consumer with mandatory local rights, those rights still
          apply.
        </p>
      </section>

      <section>
        <h2>15. Contact</h2>
        <LegalContact />
      </section>
    </LegalDocument>
  );
}
