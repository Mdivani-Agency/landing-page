import { profileLinks } from "@/lib/site";

type ProfileLinksProps = {
  className?: string;
};

export function ProfileLinks({ className }: ProfileLinksProps) {
  return (
    <p
      className={["text-sm leading-[1.6] text-muted", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-primary">Also on</span>{" "}
      {profileLinks.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? <span aria-hidden="true"> · </span> : null}
          <a
            href={link.href}
            title={link.title}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary underline-offset-[0.3em]"
          >
            {link.label}
          </a>
        </span>
      ))}
    </p>
  );
}
