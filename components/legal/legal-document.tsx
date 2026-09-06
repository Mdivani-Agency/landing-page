import type { ReactNode } from "react";
import { site } from "@/lib/site";

const articleClass = [
  "text-sm font-thin",
  "[&_a]:font-medium [&_a]:text-secondary [&_a]:underline",
  "[&_h1]:text-lg [&_h1]:font-semibold",
  "[&_header]:my-2.5 [&_header]:text-md",
  "[&_section]:mb-2.5 [&_section_h2]:mb-0.5 [&_section_h2]:font-bold",
  "[&_h3]:mb-0.5 [&_h3]:mt-1.5 [&_h3]:font-semibold",
  "[&_p]:mb-1",
  "[&_ul]:mb-1 [&_ul]:list-disc [&_ul]:pl-2.5",
  "[&_code]:rounded-[0.3rem] [&_code]:bg-[rgba(243,239,230,0.08)] [&_code]:px-[0.35em] [&_code]:py-[0.1em] [&_code]:text-secondary",
  "[&_table]:w-full [&_table]:border-collapse [&_table]:text-left",
  "[&_th]:border-b [&_th]:border-subtle [&_th]:py-1 [&_th]:pr-2 [&_th]:text-left [&_th]:font-medium",
  "[&_td]:border-t [&_td]:border-subtle [&_td]:py-1 [&_td]:pr-2 [&_td]:align-top",
].join(" ");

export function LegalDocument({ children }: { children: ReactNode }) {
  return <article className={articleClass}>{children}</article>;
}

export function LegalTable({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1 overflow-x-auto">
      <table>{children}</table>
    </div>
  );
}

export function LegalContact() {
  return (
    <address className="not-italic">
      <p>{site.personName}</p>
      <p>{site.name}</p>
      <p>{site.address}</p>
      <p>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
    </address>
  );
}
