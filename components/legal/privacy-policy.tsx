import { site } from "@/lib/site";
import {
  LegalContact,
  LegalDocument,
  LegalTable,
} from "@/components/legal/legal-document";
import {
  DOCUMENTED_GA_MEASUREMENT_ID,
  resolveMeasurementId,
} from "@/lib/analytics";

const ga4MeasurementId =
  resolveMeasurementId(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  ) ?? DOCUMENTED_GA_MEASUREMENT_ID;
const gaOptOutUrl = "https://tools.google.com/dlpage/gaoptout";

export function PrivacyPolicyContent() {
  return (
    <LegalDocument>
      <header>
        <h1 className="text-title font-semibold">Privacy Policy</h1>
        <p className="text-xs font-medium">
          <strong>Last updated: 1 September 2026</strong>
        </p>
      </header>

      <section>
        <p>
          This Privacy Policy explains how <strong>{site.name}</strong>{" "}
          (operated by {site.personName}, “we”, “us”) collects, uses, and shares
          information when you visit <a href={site.url}>{site.url}</a> (including{" "}
          <code>www.mdivani.agency</code>), send an inquiry, or book a call.
        </p>
        <p>
          The controller of personal data is {site.personName}, {site.address}.
          Contact: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <p>
          This policy describes the website. A separate written agreement covers
          paid engineering work.
        </p>
      </section>

      <section>
        <h2 className="text-md font-semibold">1. What we collect</h2>

        <h3>Information you give us</h3>
        <p>
          <strong>Project inquiry form</strong> (<code>/inquiry</code>),
          submitted to our server at <code>/api/contact</code>:
        </p>
        <ul>
          <li>Name (required)</li>
          <li>Email (required)</li>
          <li>Company</li>
          <li>Project type</li>
          <li>Budget range</li>
          <li>Timeline</li>
          <li>Project description</li>
          <li>Link to a product or site</li>
        </ul>
        <p>
          We use a hidden honeypot field to reject spam. Do not fill it.
        </p>
        <p>
          <strong>Email.</strong> If you write to{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>, we keep the contents
          of that correspondence.
        </p>
        <p>
          <strong>Google Calendar appointments.</strong> “Schedule a call” opens
          an iframe of Google Calendar appointment scheduling. If you book a
          slot, Google collects the details you enter in that booking flow
          (typically name, email, and any notes). We receive the booking as a
          calendar event.
        </p>
        <p>We do not run user accounts or logins on this site.</p>

        <h3>Information collected automatically</h3>
        <p>
          <strong>Google Analytics 4</strong> (measurement ID{" "}
          <code>{ga4MeasurementId}</code>), loaded from{" "}
          <code>www.googletagmanager.com</code>. It records page views
          (including client-side route changes), device and browser data,
          approximate location, referrer, and events such as opening the
          schedule-a-call modal (<code>schedule_call_click</code>) and a
          successful inquiry (<code>ads_conversion_About_Us_1</code>). Google
          sets cookies (commonly <code>_ga</code>, <code>_ga_*</code>). This
          runs without a cookie banner today.
        </p>
        <p>
          <strong>Vercel Web Analytics</strong> (<code>@vercel/analytics</code>).
          Page views and session metrics for the hosted site. This is
          first-party to the Vercel deployment (<code>/_vercel/insights</code> /{" "}
          <code>va.vercel-scripts.com</code>). It is designed to be cookieless;
          it still processes IP-derived and usage data on Vercel’s
          infrastructure.
        </p>
        <p>
          <strong>Error and performance monitoring (Sentry).</strong> We use
          Sentry to capture application errors and a sample of performance
          traces so we can diagnose failures. Sentry may receive technical data
          such as the page URL, browser or runtime details, and the stack trace
          for the error. We do not enable Sentry Session Replay (session
          recording) on this site.
        </p>
        <p>
          <strong>Hosting logs (Vercel).</strong> Standard request logs: IP
          address, user agent, URL, timestamp, and error traces. Used to operate
          and secure the site.
        </p>
        <p>
          <strong>Rate limiting (Upstash / Vercel KV).</strong>{" "}
          <code>POST /api/contact</code> is counted by client IP in Upstash
          Redis (via the Vercel KV REST aliases) so we can reject floods. The
          store receives the IP and a request counter for a short window. If
          those variables are unset, the same limit runs in memory on the
          server and is not shared across instances.
        </p>
        <p>
          We do not load Google Ads, Meta, Hotjar, Mixpanel, or PostHog pixels,
          and we do not use session replay. A successful inquiry still sends the
          GA4 conversion event <code>ads_conversion_About_Us_1</code>. We do
          not sell personal data.
        </p>
      </section>

      <section>
        <h2 className="text-md font-semibold">2. Why we use it</h2>
        <LegalTable>
          <thead>
            <tr>
              <th scope="col">Purpose</th>
              <th scope="col">
                Legal basis (GDPR / UK GDPR, where they apply)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Reply to inquiries and book calls</td>
              <td>Contract steps / legitimate interests</td>
            </tr>
            <tr>
              <td>Run, secure, and debug the site</td>
              <td>Legitimate interests</td>
            </tr>
            <tr>
              <td>Understand how the site is used (GA4 + Vercel Analytics)</td>
              <td>
                Legitimate interests. If you are in the EEA/UK, you may object;
                you can also block Analytics cookies in your browser
              </td>
            </tr>
            <tr>
              <td>Legal, tax, and dispute records</td>
              <td>Legal obligation / legitimate interests</td>
            </tr>
          </tbody>
        </LegalTable>
      </section>

      <section>
        <h2 className="text-md font-semibold">3. Who we share it with</h2>
        <p>Processors that see data only to provide their service:</p>
        <ul>
          <li>
            <strong>Vercel Inc.</strong> — hosting, logs, Web Analytics
          </li>
          <li>
            <strong>Google LLC</strong> — Google Analytics 4; Google Calendar
            appointment scheduling when you book
          </li>
          <li>
            <strong>Functional Software, Inc. (Sentry)</strong> — error and
            performance monitoring
          </li>
          <li>
            <strong>Resend</strong> — inquiry submissions are accepted by our{" "}
            <code>/api/contact</code> API on Vercel and delivered to{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>
            <strong>Upstash (Vercel KV)</strong> — IP-based rate limiting of{" "}
            <code>/api/contact</code>
          </li>
        </ul>
        <p>
          We may disclose information if required by law, or to professional
          advisers under confidentiality.
        </p>
        <p>
          Google, Vercel, Sentry, Resend, and Upstash may process data in the
          United States. Where GDPR/UK GDPR applies, they rely on their
          published transfer mechanisms (including Standard Contractual
          Clauses).
        </p>
      </section>

      <section>
        <h2 className="text-md font-semibold">4. Cookies and similar tech</h2>
        <LegalTable>
          <thead>
            <tr>
              <th scope="col">Tech</th>
              <th scope="col">Who</th>
              <th scope="col">What</th>
              <th scope="col">Essential?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>_ga</code>, <code>_ga_*</code> (and related GA cookies)
              </td>
              <td>Google</td>
              <td>Distinguish browsers, measure visits</td>
              <td>No — analytics</td>
            </tr>
            <tr>
              <td>Vercel Web Analytics</td>
              <td>Vercel</td>
              <td>Page/session metrics</td>
              <td>No — analytics (typically no cookie)</td>
            </tr>
            <tr>
              <td>Hosting / CDN</td>
              <td>Vercel</td>
              <td>Security and delivery</td>
              <td>Yes — site operation</td>
            </tr>
            <tr>
              <td>Google Calendar iframe</td>
              <td>Google</td>
              <td>
                Only if you open “Schedule a call”; Google may set its own
                cookies inside the iframe
              </td>
              <td>No — only if you use booking</td>
            </tr>
            <tr>
              <td>Contact rate-limit counter</td>
              <td>Upstash / Vercel KV</td>
              <td>
                IP and request count for <code>/api/contact</code> (typically
                no cookie)
              </td>
              <td>Yes — abuse protection</td>
            </tr>
          </tbody>
        </LegalTable>
        <p>
          You can refuse non-essential cookies in your browser. Blocking
          Analytics cookies does not stop the inquiry form or email. There is no
          in-site cookie banner or consent switch in the current codebase.
        </p>
      </section>

      <section>
        <h2 className="text-md font-semibold">5. How long we keep it</h2>
        <ul>
          <li>
            Inquiries and related email: as long as needed to respond and for a
            reasonable follow-up period, then deleted or archived unless we have
            an ongoing engagement or a legal reason to keep them
          </li>
          <li>
            Analytics: according to the retention set in Google Analytics and
            Vercel (typically months, not indefinite identified profiles)
          </li>
          <li>
            Calendar bookings: according to Google Calendar and our calendar
          </li>
          <li>Error reports: according to Sentry’s retention for this project</li>
          <li>
            Contact rate-limit counters: the 60-second window in Upstash /
            Vercel KV (or in memory if that store is unset)
          </li>
          <li>Server logs: Vercel’s default log retention</li>
        </ul>
      </section>

      <section>
        <h2 className="text-md font-semibold">6. Your rights</h2>
        <p>
          Depending on where you live (including the EEA, UK, and Georgia), you
          may have the right to access, correct, delete, restrict, or object to
          processing, and to data portability. You may also lodge a complaint
          with your local supervisory authority.
        </p>
        <p>
          To exercise rights, email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. We will need enough
          information to find your data (usually the email you used).
        </p>
        <p>
          You can opt out of Google Analytics with{" "}
          <a href={gaOptOutUrl}>Google’s opt-out browser add-on</a> or by
          blocking third-party cookies.
        </p>
      </section>

      <section>
        <h2 className="text-md font-semibold">7. Children</h2>
        <p>
          The site is for adult founders and businesses. We do not knowingly
          collect data from children under 16.
        </p>
      </section>

      <section>
        <h2 className="text-md font-semibold">8. Changes</h2>
        <p>
          We will post updates on this page and change the “Last updated” date.
          Material changes to analytics or processors will be reflected here.
        </p>
      </section>

      <section>
        <h2 className="text-md font-semibold">9. Contact</h2>
        <LegalContact />
      </section>
    </LegalDocument>
  );
}
