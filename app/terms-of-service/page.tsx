import type { Metadata } from "next";
import { TermsOfServiceContent } from "@/components/legal/terms-of-service";

export const metadata: Metadata = {
  title: {
    absolute:
      "Mdivani Terms of Service | Custom App Development & SaaS Scaling Experts.",
  },
  description:
    "Terms of Service for Mdio (Mdivani Agency) software development services.",
};

export default function TermsOfServicePage() {
  return (
    <div className="my-10 md:my-[10%] mx-auto">
      <TermsOfServiceContent />
    </div>
  );
}
