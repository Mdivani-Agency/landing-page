"use client";

import type { ReactNode } from "react";
import { CalendarProvider } from "@/components/calendar-provider";
import { HashScroll } from "@/components/hash-scroll";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CalendarProvider>
      <HashScroll />
      {children}
    </CalendarProvider>
  );
}
