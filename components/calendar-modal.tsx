"use client";

import { useEffect, useRef } from "react";
import { useCalendar } from "@/components/calendar-provider";
import { site } from "@/lib/site";

export function CalendarModal() {
  const { isOpen, closeCalendar } = useCalendar();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCalendar();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, closeCalendar]);

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay self-center md:items-center${isOpen ? " show" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-labelledby="calendar-modal-title"
      tabIndex={-1}
      id="my-modal"
    >
      <div
        ref={dialogRef}
        id="modal-dialog"
        className={`modal-dialog transition duration-300 md:w-[90vw]${
          isOpen
            ? ""
            : " translate-y-[100%] md:scale-[.55] md:opacity-0"
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
