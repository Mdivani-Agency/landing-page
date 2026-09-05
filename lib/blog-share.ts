const X_TEXT_MAX = 200;

export type BlogShareNetwork = "linkedin" | "x" | "reddit";

export type BlogShareLink = {
  network: BlogShareNetwork;
  label: string;
  href: string;
};

type ShareInput = {
  url: string;
  title: string;
  description?: string;
};

export function buildShareText(title: string, description?: string): string {
  const extra = description?.trim();
  const text = extra ? `${title} — ${extra}` : title;

  if (text.length <= X_TEXT_MAX) {
    return text;
  }

  return `${text.slice(0, X_TEXT_MAX - 1).trimEnd()}…`;
}

export function getBlogShareLinks({
  url,
  title,
  description,
}: ShareInput): BlogShareLink[] {
  const encodedUrl = encodeURIComponent(url);
  const text = buildShareText(title, description);

  return [
    {
      network: "linkedin",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      network: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
    },
    {
      network: "reddit",
      label: "Share on Reddit",
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}`,
    },
  ];
}
