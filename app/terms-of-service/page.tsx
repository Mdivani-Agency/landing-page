import { TermsOfServiceContent } from "@/components/legal/terms-of-service";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "Website terms for mdivani.agency, including inquiries and calls. Paid engineering work is covered by a separate agreement.",
  path: "/terms-of-service",
});

export default function TermsOfServicePage() {
  return (
    <div className="my-10 md:my-[10%] mx-auto">
      <TermsOfServiceContent />
    </div>
  );
}
