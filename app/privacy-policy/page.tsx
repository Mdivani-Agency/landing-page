import { PrivacyPolicyContent } from "@/components/legal/privacy-policy";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  absoluteTitle: "Privacy Policy | Mdivani",
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
