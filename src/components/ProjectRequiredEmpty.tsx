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
    <main className="min-h-screen flex justify-center items-center px-4 py-10 bg-[var(--background)]">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="font-[var(--font-playfair)] text-xl md:text-2xl leading-snug text-black">
          {title}
        </h1>
        <p className="text-sm text-black/70 leading-relaxed">
          Come back once you've completed the Project Quiz. The Quiz will guide you to define your project's scope, budget, and taste. Once completed, your Project Plan will appear here
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
    </main>
  );
}
