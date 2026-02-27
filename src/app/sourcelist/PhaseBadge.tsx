"use client";

interface PhaseBadgeProps {
  phase: 1 | 2 | 3;
  tag: string;
  className?: string;
}

const phaseStyles: Record<1 | 2 | 3, string> = {
  1: "bg-amber-50 text-amber-900 border-amber-200",
  2: "bg-sky-50 text-sky-900 border-sky-200",
  3: "bg-emerald-50 text-emerald-900 border-emerald-200",
};

const dotStyles: Record<1 | 2 | 3, string> = {
  1: "bg-amber-500",
  2: "bg-sky-500",
  3: "bg-emerald-500",
};

export function PhaseBadge({ phase, tag, className = "" }: PhaseBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${phaseStyles[phase]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[phase]}`} />
      {tag}
    </span>
  );
}
