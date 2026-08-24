import Image from "next/image";

type LogoProps = {
  onClick?: () => void;
};

export function Logo({ onClick }: LogoProps) {
  return (
    // Native hash link: App Router Link often skips same-page /#home scrolling.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a title="scroll to top" href="/#home" className="size-9" onClick={onClick}>
      <Image
        src="/assets/logo.svg"
        alt="Mdivani"
        width={72}
        height={72}
        className="block size-full"
        priority
      />
    </a>
  );
}
