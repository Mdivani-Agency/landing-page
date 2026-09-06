const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;

/** Production/preview GA4 property documented in README and vercel-cutover. */
export const DOCUMENTED_GA_MEASUREMENT_ID = "G-PJ84DYZ4WS";

type PendingEvent = {
  name: string;
  params?: Record<string, unknown>;
};

const pendingEvents: PendingEvent[] = [];

export function resolveMeasurementId(
  gaId = "",
  firebaseId = "",
): string | undefined {
  const raw = gaId.trim() || firebaseId.trim();
  return MEASUREMENT_ID_PATTERN.test(raw) ? raw : undefined;
}

export function getUtmSource(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("utm_source");
}

function flushPendingEvents(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  while (pendingEvents.length > 0) {
    const event = pendingEvents.shift();

    if (!event) {
      break;
    }

    window.gtag("event", event.name, event.params);
  }
}

function enqueueEvent(name: string, params?: Record<string, unknown>): void {
  pendingEvents.push({ name, params });
  flushPendingEvents();
}

export function markAnalyticsReady(): void {
  flushPendingEvents();
}

export function trackPageView(pagePath: string): void {
  enqueueEvent("page_view", {
    page_path: pagePath,
    source: getUtmSource(),
  });
}

export function trackScheduleCallClick(): void {
  enqueueEvent("schedule_call_click", {
    method: "Google Calendar",
    source: getUtmSource(),
  });
}

export function trackAdsConversionAboutUs(): void {
  enqueueEvent("ads_conversion_About_Us_1", {
    source: getUtmSource(),
  });
}
