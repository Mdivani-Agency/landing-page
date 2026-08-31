import type { ReactNode } from "react";
import { ContactCtaLink } from "@/components/conversation-button";
import { Eyebrow } from "@/components/eyebrow";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  lede: string;
  children?: ReactNode;
  showConversationButton?: boolean;
};

export function PageIntro({
  eyebrow,
  title,
  lede,
  children,
  showConversationButton = true,
}: PageIntroProps) {
  return (
    <header className="flex flex-col items-start pt-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="max-w-[18ch] font-serif text-display">{title}</h1>
      <p className="mt-3 mb-4 max-w-[62rem] text-md leading-[1.55] text-muted">
        {lede}
      </p>
      {children}
      {showConversationButton ? (
        <ContactCtaLink>Let’s talk about your product</ContactCtaLink>
      ) : null}
    </header>
  );
}
