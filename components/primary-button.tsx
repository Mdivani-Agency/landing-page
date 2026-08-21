"use client";

import type { ReactNode } from "react";
import { useCalendar } from "@/components/calendar-provider";

export function PrimaryButton({ children }: { children: ReactNode }) {
  const { openCalendar } = useCalendar();

  return (
    <button
      type="button"
      onClick={openCalendar}
      title="Schedule a call with us"
      className="bg-gradient text-md text-black font-medium rounded-md py-2 px-8 hover:scale-105 transition"
    >
      {children}
    </button>
  );
}
