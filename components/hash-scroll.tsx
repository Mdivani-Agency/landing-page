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
    const retries = [50, 200, 400].map((ms) =>
      window.setTimeout(scrollToHash, ms),
    );
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.cancelAnimationFrame(frame);
      retries.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [pathname]);

  return null;
}
