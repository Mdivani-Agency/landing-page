import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link title="scroll to top" href="/#home" className="size-9">
      <Image
        src="/assets/logo.svg"
        alt="MDIVANI Logo"
        width={72}
        height={72}
        className="block size-full"
      />
    </Link>
  );
}
