import { TermsOfServiceContent } from "@/components/legal/terms-of-service";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Terms of Service",
  absoluteTitle: "Terms of Service | Mdivani",
  description:
    "Terms of Service for Mdio (Mdivani Agency) software development services.",
  path: "/terms-of-service",
});

export default function TermsOfServicePage() {
  return (
    <div className="my-10 md:my-[10%] mx-auto">
      <TermsOfServiceContent />
    </div>
  );
}
