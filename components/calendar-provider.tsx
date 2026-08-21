"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { trackScheduleCallClick } from "@/lib/analytics";

type CalendarContextValue = {
  isOpen: boolean;
  openCalendar: () => void;
  closeCalendar: () => void;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeCalendar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openCalendar = useCallback(() => {
    setIsOpen(true);
    window.setTimeout(() => {
      trackScheduleCallClick();
    }, 100);
  }, []);

  const value = useMemo(
    () => ({ isOpen, openCalendar, closeCalendar }),
    [isOpen, openCalendar, closeCalendar],
  );

  return (
    <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
  );
}

export function useCalendar(): CalendarContextValue {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider");
  }

  return context;
}
