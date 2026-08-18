export function getUtmSource(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("utm_source");
}

export function trackPageView(pagePath: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: pagePath,
    source: getUtmSource(),
  });
}

export function trackScheduleCallClick(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "schedule_call_click", {
    method: "Google Calendar",
    source: getUtmSource(),
  });
}
