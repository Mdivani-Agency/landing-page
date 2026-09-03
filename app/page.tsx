import { HomeSections } from "@/components/sections/home-sections";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Build your AI product from idea to production | Giorgi Mdivani",
  exactTitle: true,
  description:
    "Work directly with a senior AI engineer. Architecture, the first production build, and a team when you need one.",
  path: "/",
});

export default function Home() {
  return <HomeSections />;
}
