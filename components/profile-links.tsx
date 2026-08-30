import {
  GitHubIcon,
  LinkedInIcon,
  ToptalIcon,
  UpworkIcon,
} from "@/components/icons";
import { profileLinks } from "@/lib/site";

const profileIcons = {
  LinkedIn: LinkedInIcon,
  Upwork: UpworkIcon,
  Toptal: ToptalIcon,
  GitHub: GitHubIcon,
} as const;

type ProfileLinksProps = {
  className?: string;
};

export function ProfileLinks({ className }: ProfileLinksProps) {
  return (
    <div
      className={["flex items-center gap-0.5 text-sm leading-[1.6] text-muted", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-primary mr-1">Also on</span>{" "}
      {profileLinks.map((link, index) => {
        const ProfileIcon = profileIcons[link.label];

        return (
          <span className="flex items-center gap-0.5" key={link.href}>
            {index > 0 ? <span aria-hidden="true"> · </span> : null}
            <a className="inline-flex items-center gap-0.5" href={link.href} title={link.title} target="_blank" rel="noopener noreferrer">
              <ProfileIcon className="size-2 shrink-0" />
              <span className="text-secondary underline-offset-[0.3em]">{link.label}</span>
            </a>
          </span>
        );
      })}
    </div>
  );
}
