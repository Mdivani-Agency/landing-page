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

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
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
      className="fixed inset-0 z-[1000] m-0 hidden h-screen w-screen max-h-none max-w-none items-end justify-center self-center overflow-hidden border-none bg-black/50 p-0 open:flex md:items-center [&::backdrop]:bg-black/50"
      aria-labelledby="calendar-modal-title"
      id="my-modal"
      onClose={() => {
        if (isOpen) {
          closeCalendar();
        }
      }}
    >
      <div
        id="modal-dialog"
        className={`relative h-[80vh] w-screen rounded-[5px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)] transition duration-300 md:w-[90vw]${
          isOpen ? "" : " translate-y-[100%] md:scale-[.55] md:opacity-0"
        }`}
      >
        <div className="h-full">
          <h2 id="calendar-modal-title" className="sr-only">
            Schedule a call
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="absolute -top-5 right-2 cursor-pointer border-none text-lg text-primary"
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
