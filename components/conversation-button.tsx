"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCalendar } from "@/components/calendar-provider";

type CtaVariant = "primary" | "ghost";
type CtaSize = "md" | "sm";

type ConversationButtonProps = {
  children: ReactNode;
  variant?: CtaVariant;
  size?: CtaSize;
  className?: string;
  onClick?: () => void;
};

type ContactCtaLinkProps = {
  children: ReactNode;
  variant?: CtaVariant;
  size?: CtaSize;
  className?: string;
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

export function ctaButtonClassName({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: CtaVariant;
  size?: CtaSize;
  className?: string;
} = {}): string {
  return `${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();
}

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
      title="Book a call"
      className={ctaButtonClassName({ variant, size, className })}
    >
      {children}
    </button>
  );
}

export function ContactCtaLink({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: ContactCtaLinkProps) {
  return (
    <Link
      href="/inquiry"
      title="Tell me about your project"
      className={ctaButtonClassName({ variant, size, className })}
    >
      {children}
    </Link>
  );
}
