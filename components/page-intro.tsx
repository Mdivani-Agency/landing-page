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
    <header className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display">{title}</h1>
      <p className="lede">{lede}</p>
      {children}
      <ConversationButton>Let’s talk about your product</ConversationButton>
    </header>
  );
}
