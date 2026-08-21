import { site } from "@/lib/site";

export function MailLink() {
  return (
    <a className="text-primary text-md font-regular" href={`mailto:${site.email}`}>
      <svg
        className="inline size-3"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
          stroke="#FFF9F9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 6L12 13L2 6"
          stroke="#FFF9F9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>{" "}
      {site.email}
    </a>
  );
}
