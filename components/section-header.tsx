import type { ReactNode } from "react";
import { Eyebrow } from "@/components/eyebrow";

type HeadingLevel = "h1" | "h2";

type SectionTitleProps = {
  as?: HeadingLevel;
  id?: string;
  children: ReactNode;
};

export function SectionTitle({ as: Tag = "h2", id, children }: SectionTitleProps) {
  return (
    <Tag id={id} className="font-serif text-heading">
      {children}
    </Tag>
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
  headingAs?: HeadingLevel;
  title: ReactNode;
  copy?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  headingId,
  headingAs,
  title,
  copy,
}: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-1.5">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <SectionTitle as={headingAs} id={headingId}>
        {title}
      </SectionTitle>
      {copy && <SectionCopy>{copy}</SectionCopy>}
    </header>
  );
}
