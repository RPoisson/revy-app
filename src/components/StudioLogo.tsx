"use client";

import Image from "next/image";

type StudioLogoProps = {
  /** Size variant: "default" for main headers, "sm" for progress bars / compact areas */
  size?: "default" | "sm";
  className?: string;
};

// RÊVY logo (wordmark; aspect 1024×682)
const LOGO_ASPECT = 1024 / 682;
const HEIGHT = { default: 72, sm: 48 };

export function StudioLogo({ size = "default", className = "" }: StudioLogoProps) {
  const h = HEIGHT[size];
  const w = Math.round(h * LOGO_ASPECT);

  return (
    <Image
      src="/logo.png"
      alt="Rêvy"
      width={w}
      height={h}
      className={className}
      priority
    />
  );
}
