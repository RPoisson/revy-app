"use client";

import Link from "next/link";
import { ProjectRequiredGuard } from "@/components/ProjectRequiredGuard";

const subLinks = [
  { href: "/designconcept#executive-summary", label: "Summary" },
  { href: "/designconcept#moodboards", label: "Moodboards" },
  { href: "/designconcept#decision-detail", label: "Decision Detail" },
];

export default function DesignConceptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectRequiredGuard emptyVariant="plan">
    <div className="min-h-screen bg-[var(--background)]" data-design-concept-detail>
      <div className="border-b border-black/10 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pl-8 py-4">
          <h1 className="font-[var(--font-playfair)] text-2xl md:text-3xl leading-snug text-black mb-3">
            Design Details
          </h1>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Design concept sections">
            {subLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-black/60 hover:text-black transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
    </ProjectRequiredGuard>
  );
}
