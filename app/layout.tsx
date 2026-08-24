import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Fraunces } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { CalendarModal } from "@/components/calendar-modal";
import { Footer } from "@/components/footer";
import { GradientBackground } from "@/components/gradient-background";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { site, socialLinks } from "@/lib/site";
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.personName,
  jobTitle: site.personRole,
  url: site.url,
  email: site.email,
  worksFor: {
    "@type": "Organization",
    name: site.name,
    url: site.url,
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: site.streetAddress,
    addressLocality: site.addressLocality,
    addressCountry: site.addressCountry,
  },
  sameAs: socialLinks.map((link) => link.href),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <div id="page-chrome" className="relative z-10 overflow-hidden">
            <Header />
            <main className="site-main">{children}</main>
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
