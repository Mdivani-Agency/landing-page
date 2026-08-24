"use client";

import type { ReactNode } from "react";
import { useCalendar } from "@/components/calendar-provider";

type ConversationButtonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  onClick?: () => void;
};

export function ConversationButton({
  children,
  variant = "primary",
  className = "",
  onClick,
}: ConversationButtonProps) {
  const { openCalendar } = useCalendar();
  const variantClass =
    variant === "primary" ? "btn-conversation" : "btn-ghost";

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        openCalendar();
      }}
      title="Start a conversation about your product"
      className={`${variantClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
