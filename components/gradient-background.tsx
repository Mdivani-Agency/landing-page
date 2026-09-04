"use client";

import { usePathname } from "next/navigation";

export function GradientBackground() {
  const pathname = usePathname();
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");

  return (
    <figure
      className={[
        "gradient-background fixed top-0 left-0 -z-10 hidden h-full w-full bg-[linear-gradient(40deg,var(--bg-primary),#007069,#10637d,var(--bg-primary))] lg:block",
        isBlog ? "opacity-[0.38]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="fixed top-0 left-0 h-0 w-0">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className="h-full w-full [filter:url(#goo)_blur(40px)]">
        <div className="g2" />
        <div className="g3" />
        <div className="g4" />
      </div>
    </figure>
  );
}
