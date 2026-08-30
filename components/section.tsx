import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, labelledBy, className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={["flex flex-col gap-1.5", className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}
