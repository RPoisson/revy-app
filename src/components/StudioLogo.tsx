"use client";

import Image from "next/image";

type StudioLogoProps = {
  /** Size variant: "default" for main headers, "sm" for progress bars / compact areas */
  size?: "default" | "sm";
  className?: string;
};

// RÊVY logo aspect ratio (992×356)
const LOGO_ASPECT = 992 / 356;

export function StudioLogo({ size = "default", className = "" }: StudioLogoProps) {
  const height = size === "sm" ? 18 : 28;
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <Image
      src="/logo.png"
      alt="Rêvy"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
