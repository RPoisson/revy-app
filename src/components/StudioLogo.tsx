"use client";

import Image from "next/image";

type StudioLogoProps = {
  /** Size variant: "default" matches marketing header; "sm" for compact areas */
  size?: "default" | "sm";
  className?: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function StudioLogo({ size = "default", className = "" }: StudioLogoProps) {
  const sizeClasses =
    size === "sm"
      ? "h-8 w-auto sm:h-10"
      : "h-10 w-auto sm:h-12 md:h-14 lg:h-16";

  return (
    <Image
      src={`${basePath}/revylogo.png`}
      alt="Rêvy"
      width={120}
      height={120}
      priority
      unoptimized
      className={`${sizeClasses} ${className}`}
    />
  );
}
