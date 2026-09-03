"use client";

import Image from "next/image";
import { useState } from "react";

type AvatarProps = {
  src?: string;
  alt: string;
  fallback: string;
  className?: string;
  priority?: boolean;
};

function getInitials(value: string) {
  const trimmed = value.trim();

  if (!trimmed.includes(" ") && trimmed.length <= 3) {
    return trimmed.toUpperCase();
  }

  const initials = trimmed
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || trimmed.slice(0, 2).toUpperCase();
}

export function Avatar({
  src,
  alt,
  fallback,
  className = "",
  priority = false,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src) && !hasError;
  const initials = getInitials(fallback);

  return (
    <span
      className={`relative block aspect-square w-full overflow-hidden rounded-full bg-[rgba(159,212,200,0.12)] ${className}`.trim()}
      role={showImage ? undefined : "img"}
      aria-label={showImage ? undefined : alt}
    >
      {src && showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 28rem, 100vw"
          priority={priority}
          className="object-cover object-[center_15%]"
          onError={() => setHasError(true)}
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center font-serif text-3xl leading-none text-primary"
          aria-hidden="true"
        >
          {initials}
        </span>
      )}
    </span>
  );
}
