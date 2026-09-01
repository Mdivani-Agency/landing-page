import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The analytics module keeps a module-level queue of pending events, so each
// test imports a fresh copy.
async function importAnalytics() {
  return import("@/lib/analytics");
}

beforeEach(() => {
  vi.resetModules();
  window.history.replaceState({}, "", "/");
});

afterEach(() => {
  delete window.gtag;
  vi.restoreAllMocks();
});

describe("resolveMeasurementId", () => {
  it("accepts a valid GA measurement id", async () => {
    const { resolveMeasurementId } = await importAnalytics();

    expect(resolveMeasurementId("G-PJ84DYZ4WS")).toBe("G-PJ84DYZ4WS");
  });

  it("falls back to the Firebase id when the GA id is empty", async () => {
    const { resolveMeasurementId } = await importAnalytics();

    expect(resolveMeasurementId("", "G-ABC123")).toBe("G-ABC123");
    expect(resolveMeasurementId("  ", "G-ABC123")).toBe("G-ABC123");
  });

  it("rejects ids that are not GA4 measurement ids", async () => {
    const { resolveMeasurementId } = await importAnalytics();

    expect(resolveMeasurementId("UA-12345-1")).toBeUndefined();
    expect(resolveMeasurementId("G-lowercase")).toBeUndefined();
    expect(resolveMeasurementId()).toBeUndefined();
  });
});

describe("getUtmSource", () => {
  it("reads utm_source from the query string", async () => {
    const { getUtmSource } = await importAnalytics();

    window.history.replaceState({}, "", "/?utm_source=linkedin");
    expect(getUtmSource()).toBe("linkedin");
  });

  it("returns null when there is no utm_source", async () => {
    const { getUtmSource } = await importAnalytics();

    expect(getUtmSource()).toBeNull();
  });
});

describe("event queueing", () => {
  it("sends events immediately when gtag is available", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    const { trackScheduleCallClick } = await importAnalytics();
    trackScheduleCallClick();

    expect(gtag).toHaveBeenCalledWith("event", "schedule_call_click", {
      method: "Google Calendar",
      source: null,
    });
  });

  it("sends the Google Ads contact conversion event", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    const { trackAdsConversionAboutUs } = await importAnalytics();
    trackAdsConversionAboutUs();

    expect(gtag).toHaveBeenCalledWith("event", "ads_conversion_About_Us_1", {
      source: null,
    });
  });

  it("queues events until analytics is ready, then flushes in order", async () => {
    const { trackPageView, trackScheduleCallClick, markAnalyticsReady } =
      await importAnalytics();

    trackPageView("/work");
    trackScheduleCallClick();

    const gtag = vi.fn();
    window.gtag = gtag;
    expect(gtag).not.toHaveBeenCalled();

    markAnalyticsReady();

    expect(gtag).toHaveBeenNthCalledWith(1, "event", "page_view", {
      page_path: "/work",
      source: null,
    });
    expect(gtag).toHaveBeenNthCalledWith(2, "event", "schedule_call_click", {
      method: "Google Calendar",
      source: null,
    });
  });

  it("includes the utm_source in tracked events", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    const { trackPageView } = await importAnalytics();
    window.history.replaceState({}, "", "/?utm_source=newsletter");
    trackPageView("/");

    expect(gtag).toHaveBeenCalledWith("event", "page_view", {
      page_path: "/",
      source: "newsletter",
    });
  });
});
