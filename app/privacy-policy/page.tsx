import { PrivacyPolicyContent } from "@/components/legal/privacy-policy";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How Mdivani collects, uses, and protects information on mdivani.agency.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="my-10 md:my-[10%] mx-auto">
      <PrivacyPolicyContent />
    </div>
  );
}
