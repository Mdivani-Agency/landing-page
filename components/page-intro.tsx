import type { ReactNode } from "react";
import { ConversationButton } from "@/components/conversation-button";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  lede: string;
  children?: ReactNode;
};

export function PageIntro({ eyebrow, title, lede, children }: PageIntroProps) {
  return (
    <header className="flex flex-col items-start pt-3">
      <p className="mb-1.5 text-xs uppercase tracking-caps text-secondary">
        {eyebrow}
      </p>
      <h1 className="max-w-[18ch] font-serif text-display">{title}</h1>
      <p className="mt-3 mb-4 max-w-[62rem] text-md leading-[1.55] text-muted">
        {lede}
      </p>
      {children}
      <ConversationButton>Let’s talk about your product</ConversationButton>
    </header>
  );
}
