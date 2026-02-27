"use client";

import Link from "next/link";

/**
 * Shown on Project Plan, Design Details, and Source List when the user
 * has no project yet or hasn’t completed the quiz / initiated the design.
 */
export type ProjectRequiredEmptyVariant = "plan" | "designs";

export function ProjectRequiredEmpty({ variant = "plan" }: { variant?: ProjectRequiredEmptyVariant }) {
  const title = variant === "designs" ? "No Designs Created" : "No Project Plan Created";
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10">
      <div className="w-full max-w-2xl mx-auto">
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 md:p-6 text-sm text-amber-900 space-y-4">
          <h1 className="font-[var(--font-playfair)] text-lg md:text-xl leading-snug text-amber-950">
            {title}
          </h1>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            Come back once you&apos;ve created a project and started the design intake. You can start from the Quiz to define scope, budget, and taste—then your Project Plan, Design Details, and Source List will appear here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide hover:bg-black/90 transition"
            >
              Start Project Quiz
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-black/20 bg-transparent text-sm font-medium hover:bg-black/5 transition"
            >
              Account & projects
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
