"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  markAnalyticsReady,
  resolveMeasurementId,
  trackPageView,
} from "@/lib/analytics";

const measurementId = resolveMeasurementId(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
);

export function Analytics() {
  const pathname = usePathname();
  const isReadyRef = useRef(false);
  const lastTrackedPathRef = useRef<string | null>(null);

  const trackPath = useCallback((path: string) => {
    if (!isReadyRef.current || lastTrackedPathRef.current === path) {
      return;
    }

    lastTrackedPathRef.current = path;
    trackPageView(path);
  }, []);

  useEffect(() => {
    trackPath(pathname);
  }, [pathname, trackPath]);

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        onReady={() => {
          isReadyRef.current = true;
          markAnalyticsReady();
          trackPath(pathname);
        }}
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
