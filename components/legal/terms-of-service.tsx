import { site } from "@/lib/site";

export function TermsOfServiceContent() {
  return (
    <article className="article">
      <header>
        <h1>Terms of Service for Mdio (Mdivani Agency)</h1>
        <p>
          <strong>Last Updated: 11th February 2025</strong>
        </p>
      </header>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By using our services, you affirm that you are at least 18 years of
          age or the age of majority in your jurisdiction. If you do not agree
          to these Terms, you must not use our services.
        </p>
      </section>

      <section>
        <h2>2. Services Provided</h2>
        <p>
          Mdio provides various software development services including but not
          limited to:
        </p>
        <ul>
          <li>Custom software solutions</li>
          <li>Web and mobile application development</li>
          <li>Software consulting and support</li>
          <li>Maintenance and updates</li>
        </ul>
      </section>

      <section>
        <h2>3. Service Agreement</h2>
        <p>
          For specific projects, a detailed Service Agreement will be provided,
          outlining the scope of work, project timelines, deliverables, and
          payment terms. The Service Agreement will be incorporated by reference
          into these Terms of Service.
        </p>
      </section>

      <section>
        <h2>4. Payment Terms</h2>
        <p>
          Payments for services rendered will be outlined in the Service
          Agreement. All invoices are due upon receipt unless otherwise
          specified. Late payments may incur a service charge.
        </p>
      </section>

      <section>
        <h2>5. User Responsibilities</h2>
        <p>Users agree to:</p>
        <ul>
          <li>Provide accurate and complete information when using our services.</li>
          <li>
            Not engage in any activity that disrupts or interferes with the
            operation of the services.
          </li>
          <li>
            Respect the intellectual property rights of Mdio and third parties.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Intellectual Property Rights</h2>
        <p>
          All content, software, and services provided by Mdio are the
          intellectual property of Mdio. You may not reproduce, distribute, or
          create derivative works without our explicit permission.
        </p>
      </section>

      <section>
        <h2>7. Confidentiality</h2>
        <p>
          Both parties agree to maintain confidentiality regarding any
          proprietary information shared in connection with the services. This
          obligation continues after the termination of the agreement.
        </p>
      </section>

      <section>
        <h2>8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Mdio shall not be liable for
          any indirect, incidental, special, or consequential damages arising
          out of the use of or inability to use our services.
        </p>
      </section>

      <section>
        <h2>9. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Mdio, its affiliates, and
          their employees from any claims, losses, liabilities, damages, costs,
          or expenses (including legal fees) arising out of your use of our
          services or violation of these Terms.
        </p>
      </section>

      <section>
        <h2>10. Modifications to Terms</h2>
        <p>
          Mdio reserves the right to modify these Terms at any time. Changes
          will be effective when posted on our website. Continued use of the
          services after changes constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section>
        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of <strong>Georgia</strong>, without regard to its conflict of
          law principles.
        </p>
      </section>

      <section>
        <h2>12. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact
          us:
        </p>
        <ul>
          <li>
            Email: <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li>Address: {site.address}</li>
        </ul>
      </section>
    </article>
  );
}
