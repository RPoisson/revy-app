"use client";

import Image from "next/image";

type StudioLogoProps = {
  /** Size variant: "default" matches marketing header; "sm" for compact areas */
  size?: "default" | "sm";
  className?: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function StudioLogo({ size = "default", className = "" }: StudioLogoProps) {
  // Match marketing site: revylogo.png, 120×120 intrinsic, responsive height
  const sizeClasses =
    size === "sm"
      ? "h-10 w-auto sm:h-12"
      : "h-16 w-auto sm:h-20 md:h-24 lg:h-28";

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
