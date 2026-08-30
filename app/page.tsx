import { HomeSections } from "@/components/sections/home-sections";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Senior AI Engineer & Product Architect for Founders",
  description:
    "Work directly with Giorgi Mdivani, a Toptal-vetted AI and software engineer available through Upwork, to architect and ship production-ready AI, SaaS, cloud, web, and mobile products.",
  socialDescription:
    "Senior-led AI and product engineering for founders, from architecture to production.",
  path: "/",
});

export default function Home() {
  return <HomeSections />;
}
