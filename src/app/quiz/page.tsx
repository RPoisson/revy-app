// src/app/quiz/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, Question } from "@/questions";
import { scoreQuiz, Answers as ScoringAnswers } from "@/app/scoring";
import { generateResultText, GeneratedResultText } from "@/app/resultText";
import QuestionOptions from "@/app/quiz/components/QuestionOptions";
import {
  getAnswers,
  saveAnswers,
  clearAnswers,
  QuizAnswers,
} from "@/app/quiz/lib/answersStore";
import { StudioLogo } from "@/components/StudioLogo";

function pruneInvalidAnswers(allAnswers: QuizAnswers): QuizAnswers {
  let changed = false;
  const next: QuizAnswers = { ...allAnswers };

  for (const q of QUESTIONS) {
    const current = allAnswers[q.id];
    if (!current || current.length === 0) continue;

    // Questions are never disabled; only prune which responses are still valid (visible + selectable)
    // Keep only options that are BOTH visible (showIf) and selectable (not disabledIf); never throw
    const selectableOptionIds = new Set(
      q.options
        .filter((opt) => {
          if (!opt.showIf) return true;
          try {
            return opt.showIf(allAnswers);
          } catch {
            return true;
          }
        })
        .filter((opt) => {
          if (!opt.disabledIf) return true;
          try {
            return !opt.disabledIf(allAnswers);
          } catch {
            return true; // treat as selectable on error so we don't prune
          }
        })
        .map((opt) => opt.id)
    );

    const pruned = current.filter((id) => selectableOptionIds.has(id));
    if (pruned.length !== current.length) {
      next[q.id] = pruned;
      changed = true;
    }
  }

  return changed ? next : allAnswers;
}

export default function QuizPage() {
  const router = useRouter();

  // ✅ Hydration guard
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState(0);

  // ✅ Don’t read localStorage on initial render
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const [completed, setCompleted] = useState(false);

  // Popover state for final CTA info (mobile + desktop tap)
  const [infoOpen, setInfoOpen] = useState(false);

  const total = QUESTIONS.length;
  const question = QUESTIONS[step];

  const safeProgress = total > 0 ? ((step + 1) / total) * 100 : 0;
  const isLast = step === total - 1;

  // ✅ Load answers only after mount (client-only)
  useEffect(() => {
    setMounted(true);
    const stored = getAnswers();
    setAnswers(stored);
  }, []);

  // ✅ Save only after mount (prevents server/client mismatch + avoids writing empty state)
  useEffect(() => {
    if (!mounted) return;
    saveAnswers(answers);
  }, [answers, mounted]);

  useEffect(() => {
    if (!mounted) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, mounted]);

  // Close info popover whenever you change steps (keeps deps stable)
  useEffect(() => {
    setInfoOpen(false);
  }, [step]);

  function toggleOption(q: Question, optionId: string) {
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];
      let updated: QuizAnswers;

      if (q.allowMultiple) {
        const exists = current.includes(optionId);
        const nextSelected = exists
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        updated = { ...prev, [q.id]: nextSelected };
      } else {
        updated = { ...prev, [q.id]: [optionId] };
      }

      // Prune when upstream answers change that can invalidate downstream selections
      if (q.id === "home_exterior_style" || q.id === "space_home") {
        return pruneInvalidAnswers(updated);
      }

      return updated;
    });
  }

  function handleNext() {
    if (!question) return;
    if (!isLast) setStep((s) => s + 1);
    else router.push("/brief");
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
    else router.push("/quiz/budget");
  }

  function handleExit() {
    clearAnswers();
    router.push("/");
  }

  const canGoNext = useMemo(() => {
    if (!question) return false;
    const current = answers[question.id] ?? [];
    return question.required ? current.length > 0 : true;
  }, [answers, question]);

  // ✅ Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <main className="min-h-screen flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-md text-center space-y-3">
          <div className="flex justify-start">
            <StudioLogo className="text-black/50" />
          </div>
          <p className="text-sm text-black/70">Loading your project…</p>
        </div>
      </main>
    );
  }

  if (!question && !completed) {
    return (
      <main className="min-h-screen flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-md text-center space-y-3">
          <div className="flex justify-start">
            <StudioLogo className="text-black/50" />
          </div>
          <h1 className="font-[var(--font-playfair)] text-xl">
            Something went wrong
          </h1>
          <p className="text-sm text-black/70">
            Please refresh the page to restart your style quiz.
          </p>
        </div>
      </main>
    );
  }

  if (completed) {
    const scoringAnswers = answers as ScoringAnswers;
    const styleResult = scoreQuiz(scoringAnswers);
    const resultText: GeneratedResultText = generateResultText(
      styleResult,
      scoringAnswers
    );

    const { roomDesign, title, description } = resultText;

    return (
      <main className="min-h-screen flex justify-center px-4 pt-6 pb-24 md:py-10">
        <div className="w-full max-w-xl flex flex-col gap-6">
          <div className="flex justify-start">
            <StudioLogo className="text-black/50" />
          </div>

          <h1 className="font-[var(--font-playfair)] text-xl md:text-2xl leading-snug">
            What&apos;s your Style?
          </h1>

          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
              Room Design
            </h2>
            <div className="text-sm text-black/80 space-y-1">
              {roomDesign.primaryUserLabel && (
                <div>{roomDesign.primaryUserLabel}</div>
              )}
              {roomDesign.vanityLabel && <div>{roomDesign.vanityLabel}</div>}
              {roomDesign.bathingLabel && <div>{roomDesign.bathingLabel}</div>}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
              Title
            </h2>
            <p className="text-lg text-black">{title}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
              Description
            </h2>
            <p className="text-sm leading-relaxed text-black/80">
              {description}
            </p>
          </section>

          <button
            onClick={() => {
              clearAnswers();
              router.push("/");
            }}
            className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide hover:bg-black/90 transition"
          >
            Start a new project
          </button>
        </div>
      </main>
    );
  }

  const tooltipText =
    "Revy will consider your scope and taste to shape a thoughtful design direction, grounded in what matters most for your project.";

  return (
    <main className="min-h-screen flex justify-center px-4 py-4 md:py-10">
      <div className="w-full max-w-md md:max-w-xl flex flex-col gap-6">
        {/* Page context + reassurance */}
        <section className="space-y-2">
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Step 3 of 3 — Taste
          </p>
          <h1 className="font-[var(--font-playfair)] text-xl md:text-2xl leading-snug">
            Now, let&apos;s explore your taste.
          </h1>
          <p className="text-xs md:text-sm text-black/70 leading-relaxed">
            You&apos;ll choose images and spaces you&apos;re drawn to. Revy uses
            your choices to identify your taste and create a design direction
            that fits your scope and investment range.
          </p>
        </section>

        <header className="space-y-2">
          <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
          <div className="text-[11px] text-black/60">
            <span>
              Question {step + 1} of {total}
            </span>
          </div>
        </header>

        <section className="space-y-2">
          <h2 className="font-[var(--font-playfair)] text-2xl leading-snug">
            {question!.title}
          </h2>
          {question!.subtitle && (
            <p className="text-xs md:text-sm text-black/70">
              {question!.subtitle}
            </p>
          )}
        </section>

        <section className="mt-2">
          <QuestionOptions
            question={question!}
            selected={answers[question!.id] ?? []}
            onSelect={toggleOption}
            answers={answers}
          />
        </section>

        <footer className="mt-auto pt-4">
          <div
            className="
              fixed inset-x-0 bottom-0 z-20 bg-[#F8F5EE]/95 border-t border-black/10 px-4 py-3
              md:static md:bg-transparent md:border-t-0 md:px-0 md:py-0
            "
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <button
                  onClick={handleExit}
                  className="w-full md:w-auto text-xs md:text-sm px-4 py-2 rounded-full border border-black/20 bg-transparent hover:bg-black/5 transition"
                >
                  Exit
                </button>
                <button
                  onClick={handleBack}
                  className="w-full md:w-auto text-xs md:text-sm px-4 py-2 rounded-full border border-black/20 bg-transparent hover:bg-black/5 transition"
                >
                  Back
                </button>
              </div>

              {/* Right-side action area */}
              <div className="flex items-center justify-end gap-2">
                {isLast && (
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="What happens next"
                      aria-expanded={infoOpen}
                      onClick={() => setInfoOpen((v) => !v)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/20 text-black/70 hover:bg-black/5 transition"
                    >
                      i
                    </button>

                    {infoOpen && (
                      <>
                        <button
                          type="button"
                          aria-label="Close"
                          onClick={() => setInfoOpen(false)}
                          className="fixed inset-0 z-10 cursor-default"
                          style={{ background: "transparent" }}
                        />
                        <div
                          role="tooltip"
                          className="
                            absolute bottom-10 right-0 z-20
                            w-[280px] md:w-[320px]
                            rounded-xl border border-black/10 bg-[#F8F5EE] shadow-lg
                            px-3 py-2 text-[11px] leading-relaxed text-black/70
                          "
                        >
                          {tooltipText}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="w-full md:w-auto text-xs md:text-sm px-8 py-2 rounded-full bg-black text-[#F8F5EE] disabled:opacity-40 hover:bg-black/90 transition"
                >
                  {isLast ? "Let’s design your project" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
