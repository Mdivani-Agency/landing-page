"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { MailLink } from "@/components/mail-link";
import { acquireScrollLock, releaseScrollLock } from "@/lib/scroll-lock";
import { sectionLinks } from "@/lib/site";

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
      className={`header fixed px-2 md:px-6 z-50${hidden ? " hide-header" : ""}`}
    >
      <Logo />
      <nav aria-label="navigation" className="nav hidden md:grid">
        {sectionLinks.map((link) => (
          <a key={link.href} title={link.title} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <button
        type="button"
        id="burger"
        className="md:hidden flex items-center py-2"
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
      <div
        id="mobile-nav"
        className={`${mobileOpen ? "flex" : "hidden"} absolute top-0 left-0 z-10 flex-col w-full items-center justify-end gap-4 pb-4 px-2 bg-black h-screen md:hidden`}
      >
        <div className="w-full flex justify-between items-center mb-auto">
          <Logo onClick={closeMobileNav} />
          <button
            type="button"
            id="burger-close"
            className="md:hidden flex items-center py-2 cursor-pointer hover:opacity-80"
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
        <nav aria-label="navigation" className="mobile-nav flex flex-col w-full px-2">
          {sectionLinks.map((link) => (
            <a
              key={link.href}
              title={link.title}
              href={link.href}
              onClick={closeMobileNav}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <MailLink />
      </div>
    </header>
  );
}
