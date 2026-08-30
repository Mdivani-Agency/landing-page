import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

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
