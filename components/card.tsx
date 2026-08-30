import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";

const variantBorders = {
  default: "border-subtle",
  featured: "border-[rgba(159,212,200,0.35)]",
} as const;

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
      className={["rounded-card border bg-card p-3", variantBorders[variant], className]
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
