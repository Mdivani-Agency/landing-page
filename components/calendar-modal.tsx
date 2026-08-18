"use client";

import { useEffect, useRef } from "react";
import { useCalendar } from "@/components/calendar-provider";
import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";
import { site } from "@/lib/site";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], iframe, [tabindex]:not([tabindex="-1"])';

export function CalendarModal() {
  const { isOpen, closeCalendar } = useCalendar();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement;
    const pageChrome = document.getElementById("page-chrome");
    closeButtonRef.current?.focus();
    acquireScrollLock();
    pageChrome?.setAttribute("inert", "");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCalendar();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const overlay = overlayRef.current;

      if (!overlay) {
        return;
      }

      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !overlay.contains(active))) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && (active === last || !overlay.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      pageChrome?.removeAttribute("inert");
      releaseScrollLock();

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, closeCalendar]);

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay self-center md:items-center${isOpen ? " show" : ""}`}
      role={isOpen ? "dialog" : undefined}
      aria-modal={isOpen ? true : undefined}
      aria-hidden={!isOpen}
      aria-labelledby={isOpen ? "calendar-modal-title" : undefined}
      tabIndex={-1}
      id="my-modal"
    >
      <div
        id="modal-dialog"
        className={`modal-dialog transition duration-300 md:w-[90vw]${
          isOpen ? "" : " translate-y-[100%] md:scale-[.55] md:opacity-0"
        }`}
      >
        <div className="modal-content h-full">
          <h2 id="calendar-modal-title" className="sr-only">
            Schedule a call
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close right-2"
            data-dismiss="modal"
            aria-label="Close"
            onClick={closeCalendar}
          >
            <span aria-hidden="true">&times;</span>
          </button>
          {isOpen ? (
            <iframe
              title="Google Calendar"
              src={site.calendarUrl}
              className="h-full w-full border-0"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
