import { HomeSections } from "@/components/sections/home-sections";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Senior software ownership for founders who need to ship | Mdivani Agency",
  exactTitle: true,
  description:
    "Prototype-to-production sprints, AI that survives real users, and fractional senior ownership — for UK and US founders who need a critical path owner, not a staff-aug bench.",
  path: "/",
});

export default function Home() {
  return <HomeSections />;
}
