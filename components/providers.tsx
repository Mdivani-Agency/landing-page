"use client";

import type { ReactNode } from "react";
import { CalendarProvider } from "@/components/calendar-provider";

export function Providers({ children }: { children: ReactNode }) {
  return <CalendarProvider>{children}</CalendarProvider>;
}
