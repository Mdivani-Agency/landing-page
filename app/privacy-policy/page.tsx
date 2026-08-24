import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy";

export const metadata: Metadata = {
  title: {
    absolute: "Privacy Policy | Mdivani",
  },
  description:
    "How Mdivani collects, uses, and protects information on mdivani.agency.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="my-10 md:my-[10%] mx-auto">
      <PrivacyPolicyContent />
    </div>
  );
}
