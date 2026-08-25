"use client";

import Image from "next/image";
import { useState } from "react";

type AvatarProps = {
  src?: string;
  alt: string;
  fallback: string;
  className?: string;
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

export function Avatar({ src, alt, fallback, className = "" }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src) && !hasError;
  const initials = getInitials(fallback);

  return (
    <span
      className={`avatar ${className}`.trim()}
      role={showImage ? undefined : "img"}
      aria-label={showImage ? undefined : alt}
    >
      {src && showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 28rem, 100vw"
          className="avatar-image"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="avatar-fallback" aria-hidden="true">
          {initials}
        </span>
      )}
    </span>
  );
}
