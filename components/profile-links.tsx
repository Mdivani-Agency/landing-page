import { profileLinks } from "@/lib/site";

type ProfileLinksProps = {
  className?: string;
};

export function ProfileLinks({ className }: ProfileLinksProps) {
  return (
    <p className={["profile-links", className].filter(Boolean).join(" ")}>
      <span className="profile-links-label">Also on</span>{" "}
      {profileLinks.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? <span aria-hidden="true"> · </span> : null}
          <a
            href={link.href}
            title={link.title}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
          </a>
        </span>
      ))}
    </p>
  );
}
