import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Roboto } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { CalendarModal } from "@/components/calendar-modal";
import { Footer } from "@/components/footer";
import { GradientBackground } from "@/components/gradient-background";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { site } from "@/lib/site";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s | Mdivani",
  },
  description: site.description,
  icons: {
    icon: [{ url: "/assets/favicon.png", sizes: "32x32", type: "image/png" }],
  },
  openGraph: {
    title: site.ogTitle,
    description: site.ogDescription,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/assets/images/logo.png" }],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="font-sans">
        <Providers>
          <div id="page-chrome" className="relative z-10 overflow-hidden">
            <figure className="absolute w-full h-screen -z-10 bg-image bg-cover lg:bg-contain lg:h-full" />
            <Header />
            <main className="container flex flex-col px-2 lg:px-10 mx-auto gap-8 2xl:gap-15 z-10">
              {children}
            </main>
            <Footer />
          </div>
          <CalendarModal />
          <GradientBackground />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
