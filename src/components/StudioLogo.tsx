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
      ? "h-5 w-auto sm:h-6"
      : "h-6 w-auto sm:h-7 md:h-8";

  return (
    <Image
      src={logo}
      alt="Rêvy"
      priority
      className={`${sizeClasses} ${className}`}
    />
  );
}
