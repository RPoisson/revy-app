"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProjectRequiredGuard } from "@/components/ProjectRequiredGuard";

const subLinks = [
  { href: "/designconcept/executive-summary", label: "Executive Summary" },
  { href: "/designconcept/moodboard-layouts", label: "Moodboard Layouts" },
  { href: "/designconcept/decision-detail", label: "Decision Detail" },
];

export default function DesignConceptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProjectRequiredGuard>
    <div className="min-h-screen bg-[var(--background)]" data-design-concept-detail>
      <div className="border-b border-black/10 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-[var(--font-playfair)] text-xl md:text-2xl font-bold tracking-tight text-black mb-3">
            Design Concept
          </h1>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Design concept sections">
            {subLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  pathname === href ? "text-black" : "text-black/60 hover:text-black"
                }`}
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
