import Image from "next/image";

type LogoProps = {
  onClick?: () => void;
};

export function Logo({ onClick }: LogoProps) {
  return (
    // Native hash link: App Router Link often skips same-page /#home scrolling.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a
      title="scroll to top"
      href="/#home"
      className="inline-flex h-9 items-center"
      onClick={onClick}
    >
      <Image
        src="/assets/logo-wordmark.svg"
        alt="Mdivani"
        width={130}
        height={36}
        className="block h-9 w-auto"
        priority
      />
    </a>
  );
}
