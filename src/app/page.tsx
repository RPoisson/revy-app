// src/app/page.tsx
import Link from "next/link";
import { StudioLogo } from "@/components/StudioLogo";

export default function QuizIntroPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-8">
        {/* Context */}
        <div className="text-center space-y-3">
          <div className="flex justify-end">
            <StudioLogo className="text-black/50" />
          </div>

          <h1 className="font-[var(--font-playfair)] text-3xl leading-tight">
            Let’s get clarity on your project, together.
          </h1>

          <p className="text-sm text-black/70 leading-relaxed">
            You’ll answer a short set of guided questions, starting with scope and investment range. Then we’ll explore your taste to guide a design direction that’s intentional and doable.
          </p>
        </div>

        {/* What to expect */}
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-900">
            What to expect
          </h2>

          <ul className="space-y-3 text-sm text-neutral-700">
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-xs font-semibold">
                1
              </span>
              <span>
                We’ll start by defining what you’re building or updating, and your timeline for your project.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-xs font-semibold">
                2
              </span>
              <span>
                You’ll choose an investment range so recommendations stay
                realistic and aligned.
              </span>
            </li>

            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-xs font-semibold">
                3
              </span>
              <span>
                Then we’ll explore your aesthetic preferences to guide the
                design direction.
              </span>
            </li>
          </ul>
        </div>

        {/* Reassurance */}
        <div className="rounded-2xl border border-neutral-200 p-5 space-y-2">
          <p className="text-sm font-semibold text-neutral-900">
            No commitments, no locking anything in
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Your answers help us guide decisions. You can adjust inputs at any time.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/quiz/scope"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide hover:bg-black/90 transition"
          >
            Begin
          </Link>

          <p className="text-xs text-black/50">
            Most people complete this in under 7 minutes
          </p>
        </div>
      </div>
    </main>
  );
}
