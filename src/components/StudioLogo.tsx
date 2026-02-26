"use client";

import Image from "next/image";

type StudioLogoProps = {
  /** Size variant: "default" for main headers, "sm" for progress bars / compact areas */
  size?: "default" | "sm";
  className?: string;
};

// RÊVY logo (square icon with concentric circles)
const SIZE = { default: 36, sm: 24 };

export function StudioLogo({ size = "default", className = "" }: StudioLogoProps) {
  const s = SIZE[size];

  return (
    <Image
      src="/logo.png"
      alt="Rêvy"
      width={s}
      height={s}
      className={className}
      priority
    />
  );
}
