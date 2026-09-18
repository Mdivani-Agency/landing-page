import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

const variantBorders = {
  default: "border-subtle",
  featured: "border-[rgba(159,212,200,0.35)]",
} as const;

// Cards in a grid stretch to equal height, so a card with less content than its
// neighbours has slack to distribute. The column layout lets CardFooter claim it.
const cardShell = "flex h-full flex-col rounded-card border bg-card p-3";

/**
 * Opts a card into the row tracks declared by its parent grid so that the
 * eyebrow, title, summary, and body of every card in a row band share
 * heights — a title that wraps to two lines no longer pushes the rows beneath it
 * out of step with the neighbouring cards.
 *
 * Requires exactly four direct children, and a parent grid that declares four
 * row tracks per band. Row gaps are zeroed because cards space their own
 * children with margins; the parent gap still separates bands.
 */
export const cardSubgrid =
  "md:row-span-4 md:grid md:grid-rows-subgrid md:gap-y-0";

type CardOwnProps<T extends ElementType> = {
  as?: T;
  variant?: keyof typeof variantBorders;
  className?: string;
};

type CardProps<T extends ElementType> = CardOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof CardOwnProps<T>>;

export function Card<T extends ElementType = "article">({
  as,
  variant = "default",
  className,
  ...rest
}: CardProps<T>) {
  const Tag: ElementType = as ?? "article";

  return (
    <Tag
      className={[cardShell, variantBorders[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}

type CardTitleProps = {
  children: ReactNode;
};

export function CardTitle({ children }: CardTitleProps) {
  return (
    <h3 className="mb-1.5 font-serif text-title font-medium">{children}</h3>
  );
}

type CardTextProps = {
  children: ReactNode;
};

export function CardText({ children }: CardTextProps) {
  return <p className="text-sm leading-4 text-muted">{children}</p>;
}

type CardFooterProps = {
  className?: string;
  children: ReactNode;
};

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={["mt-auto", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
