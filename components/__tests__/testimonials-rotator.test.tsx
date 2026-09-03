import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestimonialsRotator } from "@/components/testimonials-rotator";
import type { Testimonial } from "@/lib/content";

const IDLE_MS = 5000;
const FADE_MS = 400;

const testimonials: readonly Testimonial[] = [
  {
    author: "Ada Lovelace",
    linkedinUrl: "https://www.linkedin.com/in/ada/",
    body: "First quote",
  },
  {
    author: "Grace Hopper",
    linkedinUrl: "https://www.linkedin.com/in/grace/",
    body: "Second quote",
  },
  {
    author: "Alan Turing",
    linkedinUrl: "https://www.linkedin.com/in/alan/",
    body: "Third quote",
  },
];

function getFigures() {
  return Array.from(document.querySelectorAll("figure"));
}

function expectActiveFigure(activeIndex: number) {
  getFigures().forEach((figure, index) => {
    expect(figure).toHaveAttribute(
      "aria-hidden",
      index === activeIndex ? "false" : "true",
    );
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  // nextIndex picks a random other testimonial; pin it to "the next one".
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("TestimonialsRotator", () => {
  it("renders nothing when there are no testimonials", () => {
    const { container } = render(<TestimonialsRotator testimonials={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows only the first testimonial initially", () => {
    render(<TestimonialsRotator testimonials={testimonials} />);

    expect(screen.getByText("First quote")).toBeInTheDocument();
    expectActiveFigure(0);
  });

  it("rotates to the next testimonial after the idle delay and fade", () => {
    render(<TestimonialsRotator testimonials={testimonials} />);

    act(() => {
      vi.advanceTimersByTime(IDLE_MS);
    });
    // Mid-fade the index has not moved yet.
    expectActiveFigure(0);

    act(() => {
      vi.advanceTimersByTime(FADE_MS);
    });
    expectActiveFigure(1);

    act(() => {
      vi.advanceTimersByTime(IDLE_MS + FADE_MS);
    });
    expectActiveFigure(2);
  });

  it("does not rotate a single testimonial", () => {
    render(<TestimonialsRotator testimonials={[testimonials[0]]} />);

    act(() => {
      vi.advanceTimersByTime((IDLE_MS + FADE_MS) * 5);
    });

    expectActiveFigure(0);
  });

  it("pauses on hover and resumes when the pointer leaves", () => {
    render(<TestimonialsRotator testimonials={testimonials} />);

    const region = screen.getByRole("region", { name: "Client testimonials" });
    const hoverArea = region.firstElementChild as HTMLElement;

    fireEvent.pointerEnter(hoverArea);
    expect(region).toHaveAttribute("data-paused", "true");

    act(() => {
      vi.advanceTimersByTime((IDLE_MS + FADE_MS) * 3);
    });
    expectActiveFigure(0);

    fireEvent.pointerLeave(hoverArea);
    expect(region).toHaveAttribute("data-paused", "false");

    act(() => {
      vi.advanceTimersByTime(IDLE_MS + FADE_MS);
    });
    expectActiveFigure(1);
  });

  it("toggles a sticky pause on touch taps outside links", () => {
    render(<TestimonialsRotator testimonials={testimonials} />);

    const region = screen.getByRole("region", { name: "Client testimonials" });

    fireEvent.pointerDown(region, { pointerType: "touch" });
    expect(region).toHaveAttribute("data-paused", "true");

    act(() => {
      vi.advanceTimersByTime((IDLE_MS + FADE_MS) * 3);
    });
    expectActiveFigure(0);

    fireEvent.pointerDown(region, { pointerType: "touch" });
    expect(region).toHaveAttribute("data-paused", "false");
  });

  it("ignores mouse pointer-down for the sticky pause", () => {
    render(<TestimonialsRotator testimonials={testimonials} />);

    const region = screen.getByRole("region", { name: "Client testimonials" });

    fireEvent.pointerDown(region, { pointerType: "mouse" });
    expect(region).toHaveAttribute("data-paused", "false");
  });

  it("waits for the quotes to be on screen before rotating", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    let notify: ((entries: { isIntersecting: boolean }[]) => void) | undefined;

    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe = observe;
        disconnect = disconnect;
        unobserve = vi.fn();
        takeRecords = vi.fn();
        constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
          notify = callback;
        }
      },
    );

    render(<TestimonialsRotator testimonials={testimonials} />);
    expect(observe).toHaveBeenCalledTimes(1);

    act(() => {
      notify?.([{ isIntersecting: false }]);
      vi.advanceTimersByTime((IDLE_MS + FADE_MS) * 3);
    });
    expectActiveFigure(0);

    act(() => {
      notify?.([{ isIntersecting: true }]);
      vi.advanceTimersByTime(IDLE_MS + FADE_MS);
    });
    expectActiveFigure(1);
  });
});
