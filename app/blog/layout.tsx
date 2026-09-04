import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="blog-reading [--card-bg:rgba(8,9,11,0.82)]">
      {children}
    </div>
  );
}
