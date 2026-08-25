import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { capabilities } from "@/lib/content";

const capability = capabilities[1];

export const metadata: Metadata = {
  title: "Product Development",
  description:
    "Greenfield SaaS, web, mobile, and backend development with Giorgi Mdivani — senior product engineering for founders.",
};

export default function ProductDevelopmentPage() {
  return (
    <article>
      <PageIntro
        eyebrow="Product Development"
        title="A first product with a senior engineer on the critical path."
        lede="Web, mobile, APIs, auth, payments, and the integrations that make an MVP something customers can actually use."
      />
      <section className="band" aria-labelledby="product-list-heading">
        <h2 id="product-list-heading" className="section-title">
          What this covers
        </h2>
        <ul className="detail-list">
          {capability.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
