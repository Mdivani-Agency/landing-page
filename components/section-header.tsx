import type { ReactNode } from "react";
import { Eyebrow } from "@/components/eyebrow";

type SectionTitleProps = {
  id?: string;
  children: ReactNode;
};

export function SectionTitle({ id, children }: SectionTitleProps) {
  return (
    <h2 id={id} className="max-w-[22ch] font-serif text-heading">
      {children}
    </h2>
  );
}

type SectionCopyProps = {
  children: ReactNode;
};

export function SectionCopy({ children }: SectionCopyProps) {
  return (
    <p className="max-w-[62rem] text-md leading-[1.55] text-muted">{children}</p>
  );
}

type SectionHeaderProps = {
  eyebrow?: ReactNode;
  headingId: string;
  title: ReactNode;
  copy?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  headingId,
  title,
  copy,
}: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-1.5">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <SectionTitle id={headingId}>{title}</SectionTitle>
      {copy && <SectionCopy>{copy}</SectionCopy>}
    </header>
  );
}
