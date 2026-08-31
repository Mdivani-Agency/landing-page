"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ConversationButton } from "@/components/conversation-button";
import { Logo } from "@/components/logo";
import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";
import { navLinks } from "@/lib/site";
import { CalendarIcon } from "lucide-react";

export function Header() {
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollTop = useRef(0);
  const mobileOpenRef = useRef(false);

  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    lastScrollTop.current = window.scrollY || document.documentElement.scrollTop;

    const onScroll = () => {
      if (mobileOpenRef.current) {
        return;
      }

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setHidden(scrollTop > lastScrollTop.current && scrollTop > 0);
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    acquireScrollLock();
    return () => {
      releaseScrollLock();
    };
  }, [mobileOpen]);

  const closeMobileNav = () => {
    setMobileOpen(false);
  };

  return (
    <header
      id="header"
      className={`fixed top-0 left-0 z-50 w-full bg-[rgba(10,10,10,0.5)] shadow-[0_2px_12px_rgba(255,249,249,0.1)] backdrop-blur-[5px] transition-all duration-300 motion-reduce:transition-none${hidden ? " -translate-y-full opacity-0" : ""}`}
    >
      <div className="mx-auto flex w-full max-w-site items-center justify-between px-2">
        <Logo onClick={closeMobileNav} />
        <nav aria-label="Primary" className="hidden items-center gap-4 py-2.5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              title={link.title}
              href={link.href}
              className="text-sm font-normal text-primary no-underline hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <ConversationButton size="sm">
            <CalendarIcon className="size-2.5 mr-1" />
            Schedule a call
          </ConversationButton>
        </div>
        <button
          type="button"
          id="burger"
          className="lg:hidden flex items-center py-2"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label="Open navigation"
          onClick={() => {
            setHidden(false);
            setMobileOpen(true);
          }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
      <div
        id="mobile-nav"
        className={`${mobileOpen ? "flex" : "hidden"} absolute inset-0 z-10 flex-col bg-black h-screen lg:hidden`}
      >
        <div className="mx-auto flex h-full w-full max-w-site flex-col items-center justify-end gap-4 px-2 pb-4">
          <div className="w-full flex justify-between items-center mb-auto">
            <Logo onClick={closeMobileNav} />
            <button
              type="button"
              id="burger-close"
              className="flex items-center py-2 cursor-pointer hover:opacity-80"
              aria-label="Close navigation"
              onClick={closeMobileNav}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav aria-label="Primary" className="flex flex-col w-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                title={link.title}
                href={link.href}
                onClick={closeMobileNav}
                className="w-full border-b border-gray-700 px-2.5 py-[0.5rem] text-right text-sm font-normal text-primary no-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="w-full pb-6">
            <ConversationButton className="w-full" onClick={closeMobileNav}>
              Schedule a call
            </ConversationButton>
          </div>
        </div>
      </div>
    </header>
  );
}
