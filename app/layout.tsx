import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Fraunces } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { CalendarModal } from "@/components/calendar-modal";
import { Footer } from "@/components/footer";
import { GradientBackground } from "@/components/gradient-background";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { serializeJsonLd, siteIcons, socialImage } from "@/lib/metadata";
import { profileLinks, site } from "@/lib/site";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next"
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s | Mdivani",
  },
  description: site.description,
  icons: siteIcons,
  openGraph: {
    title: site.ogTitle,
    description: site.ogDescription,
    url: site.url,
    siteName: site.name,
    images: [socialImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.ogTitle,
    description: site.ogDescription,
    images: [socialImage.url],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.personName,
  jobTitle: site.personRole,
  url: site.url,
  email: site.email,
  sameAs: profileLinks.map((link) => link.href),
  worksFor: {
    "@type": "Organization",
    name: site.name,
    url: site.url,
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address,
    addressLocality: "Tbilisi",
    addressCountry: "GE",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <Providers>
          <div id="page-chrome" className="relative z-10 overflow-hidden">
            <Header />
            <main className="mx-auto mt-11 flex w-full max-w-site flex-col gap-10 px-4 2xl:px-2 pb-10">
              {children}
            </main>
            <Footer />
          </div>
          <CalendarModal />
          <GradientBackground />
          <Analytics />
        </Providers>
        <VercelAnalytics />
      </body>
    </html>
  );
}
