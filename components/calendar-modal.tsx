"use client";

import { useEffect, useRef } from "react";
import { useCalendar } from "@/components/calendar-provider";
import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";
import { site } from "@/lib/site";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], iframe, [tabindex]:not([tabindex="-1"])';

export function CalendarModal() {
  const { isOpen, closeCalendar } = useCalendar();
  const overlayRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = overlayRef.current;

    if (!dialog) {
      return;
    }

    if (!isOpen) {
      if (dialog.open) {
        dialog.close();
      }
      return;
    }

    const previouslyFocused = document.activeElement;
    const pageChrome = document.getElementById("page-chrome");

    if (!dialog.open) {
      dialog.showModal();
    }

    closeButtonRef.current?.focus();
    acquireScrollLock();
    pageChrome?.setAttribute("inert", "");

    const focusableInDialog = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCalendar();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = focusableInDialog();

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (dialog.contains(active) && active !== dialog && active !== first && active !== last) {
        return;
      }

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;

      if (!(target instanceof Node) || dialog.contains(target)) {
        return;
      }

      closeButtonRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      pageChrome?.removeAttribute("inert");
      releaseScrollLock();

      if (dialog.open) {
        dialog.close();
      }

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, closeCalendar]);

  return (
    <dialog
      ref={overlayRef}
      className={`modal-overlay self-center md:items-center${isOpen ? " show" : ""}`}
      aria-labelledby="calendar-modal-title"
      id="my-modal"
      onCancel={(event) => {
        event.preventDefault();
        closeCalendar();
      }}
      onClose={() => {
        if (isOpen) {
          closeCalendar();
        }
      }}
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
    </dialog>
  );
}
