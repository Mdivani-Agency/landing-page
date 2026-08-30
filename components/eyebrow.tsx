import type { ReactNode } from "react";

const variantClasses = {
  // Section-level eyebrows: small caps in the accent color.
  section: "mb-1.5 text-xs uppercase tracking-caps text-secondary",
  // Card-level eyebrows are intentionally different: the pre-Tailwind
  // stylesheet had `.capability-card p` outranking `.eyebrow`, so eyebrows
  // inside cards render slightly larger and muted.
  card: "mb-1.5 text-sm uppercase leading-4 tracking-caps text-muted",
} as const;

type EyebrowProps = {
  variant?: keyof typeof variantClasses;
  children: ReactNode;
};

export function Eyebrow({ variant = "section", children }: EyebrowProps) {
  return <p className={variantClasses[variant]}>{children}</p>;
}
