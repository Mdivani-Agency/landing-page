import Link from "next/link";

export function Logo() {
  return (
    <Link title="scroll to top" href="/#home" className="size-9">
      <img
        src="/assets/logo.svg"
        alt="MDIVANI Logo"
        className="block size-full"
      />
    </Link>
  );
}
