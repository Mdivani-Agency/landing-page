"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function scrollToHash() {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) {
    return;
  }

  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  target.scrollIntoView({ block: "start", behavior: "auto" });
}

export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    scrollToHash();
    const frame = window.requestAnimationFrame(scrollToHash);
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [pathname]);

  return null;
}
