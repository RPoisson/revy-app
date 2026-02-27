"use client";

import Image from "next/image";
import logo from "@/assets/revylogo.png";

type StudioLogoProps = {
  /** Size variant: "default" matches marketing header; "sm" for compact areas */
  size?: "default" | "sm";
  className?: string;
};

export function StudioLogo({ size = "default", className = "" }: StudioLogoProps) {
  const sizeClasses =
    size === "sm"
      ? "h-6 w-auto sm:h-8"
      : "h-8 w-auto sm:h-10 md:h-12 lg:h-14";

  return (
    <Image
      src={logo}
      alt="Rêvy"
      priority
      className={`${sizeClasses} ${className}`}
    />
  );
}
