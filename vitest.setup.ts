import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Next.js `server-only` throws outside the RSC compiler. Tests import
// server modules (Supabase helpers) in jsdom, so stub the guard.
vi.mock("server-only", () => ({}));

// `@sentry/nextjs` loads a bundler plugin that fails to resolve under Vitest.
// Route handlers and the blog data layer import it for error reporting, so
// stub the surface the application calls. Tests that assert on reporting
// re-mock it locally with their own spy.
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// jsdom does not implement the <dialog> methods CalendarModal relies on.
if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.open = true;
  };

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}

// jsdom does not implement matchMedia; TestimonialsRotator relies on it for
// the prefers-reduced-motion check.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
