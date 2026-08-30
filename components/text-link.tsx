import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type TextLinkProps = ComponentPropsWithoutRef<typeof Link>;

export function TextLink({ className, ...props }: TextLinkProps) {
  return (
    <Link
      className={[
        "inline-flex items-center justify-center text-sm leading-[1.2] text-secondary underline underline-offset-[0.3em]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
