"use client";

import type { ReactNode } from "react";
import { useCalendar } from "@/components/calendar-provider";

type ConversationButtonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  className?: string;
  onClick?: () => void;
};

const baseClass =
  "inline-flex max-w-fit cursor-pointer items-center justify-center rounded-full border no-underline leading-[1.2] hover:opacity-[0.86]";

const variantClasses = {
  primary: "border-transparent bg-primary font-semibold text-canvas",
  ghost: "border-subtle bg-transparent text-primary",
} as const;

const sizeClasses = {
  md: "min-h-6 px-3 text-sm",
  sm: "min-h-5 px-[1.8rem] text-xs",
} as const;

export function ConversationButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
}: ConversationButtonProps) {
  const { openCalendar } = useCalendar();

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        openCalendar();
      }}
      title="Start a conversation about your product"
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
