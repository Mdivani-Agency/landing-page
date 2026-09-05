import { LinkedInIcon, RedditIcon, XIcon } from "@/components/icons";
import { getBlogShareLinks, type BlogShareNetwork } from "@/lib/blog-share";

const shareIcons: Record<
  BlogShareNetwork,
  typeof LinkedInIcon | typeof XIcon | typeof RedditIcon
> = {
  linkedin: LinkedInIcon,
  x: XIcon,
  reddit: RedditIcon,
};

type BlogShareProps = {
  url: string;
  title: string;
  description?: string;
};

export function BlogShare({ url, title, description }: BlogShareProps) {
  const links = getBlogShareLinks({ url, title, description });

  return (
    <nav
      aria-label="Share this post"
      className="mt-2 flex items-center gap-0.5 lg:mt-4"
    >
      <p className="mr-1 text-xs uppercase tracking-caps text-secondary">
        Share
      </p>
      {links.map((link) => {
        const Icon = shareIcons[link.network];

        return (
          <a
            key={link.network}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="inline-flex size-5 items-center justify-center rounded-full text-muted hover:text-primary hover:opacity-[0.86]"
          >
            <Icon className="size-2.5 shrink-0" />
          </a>
        );
      })}
    </nav>
  );
}
