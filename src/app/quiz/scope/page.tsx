//revy-quiz/quiz/scope/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/questions";
import QuestionOptions from "@/app/quiz/components/QuestionOptions";
import { SCOPE_QUESTIONS } from "@/app/quiz/scope/questions";
import {
  clearAnswers,
  getAnswers,
  saveAnswers,
  type QuizAnswers,
} from "@/app/quiz/lib/answersStore";
import Link from "next/link";
import { useProjects } from "@/context/ProjectContext";
import { getDesignsCreated } from "@/lib/designsCreatedStore";

function qtyKey(optionId: string) {
  return `rooms_qty_${optionId}`;
}

const COUNTABLE_ROOM_IDS = new Set<string>([
  "guest_bath",
  "powder",
  "secondary_bath",
  "kids_bath",
  "nursery_bedroom",
  "child_bedroom",
  "teen_bedroom",
]);

export default function ScopePage() {
  const router = useRouter();
  const { currentProjectId } = useProjects();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(() => getAnswers(currentProjectId ?? undefined));
   const [locked, setLocked] = useState(false);

  const total = SCOPE_QUESTIONS.length;
  const question = SCOPE_QUESTIONS[step];

  const safeProgress = total > 0 ? ((step + 1) / total) * 100 : 0;
  const isLast = step === total - 1;

  useEffect(() => {
    setAnswers(getAnswers(currentProjectId ?? undefined));
    setLocked(getDesignsCreated(currentProjectId ?? undefined));
  }, [currentProjectId]);

  useEffect(() => {
    saveAnswers(answers, currentProjectId ?? undefined);
  }, [answers, currentProjectId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const canGoNext = useMemo(() => {
    if (!question) return false;
    if (locked) return true;
    const current = answers[question.id] ?? [];
    const baseOk = question.required ? current.length > 0 : true;

    // ✅ Rooms step: require counts for selected countable room types
    if (question.id === "rooms") {
      const missingQty = current.some((optId) => {
        if (!COUNTABLE_ROOM_IDS.has(optId)) return false;
        const v = answers[qtyKey(optId)] ?? [];
        return v.length === 0;
      });
      return baseOk && !missingQty;
    }

    return baseOk;
  }, [answers, question, locked]);

  function toggleOption(q: Question, optionId: string) {
    if (locked) return;
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];

      if (q.allowMultiple) {
        const exists = current.includes(optionId);
        const nextSelected = exists
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];

        // ✅ If unselecting a countable room, also clear its qty answer
        if (q.id === "rooms" && exists && COUNTABLE_ROOM_IDS.has(optionId)) {
          const key = qtyKey(optionId);
          const { [key]: _, ...rest } = prev as any;
          return { ...rest, [q.id]: nextSelected } as QuizAnswers;
        }

        return { ...prev, [q.id]: nextSelected };
      }

      return { ...prev, [q.id]: [optionId] };
    });
  }

  function handleNext() {
    if (!question) return;
    if (!isLast) setStep((s) => s + 1);
    else router.push("/quiz/budget");
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleExit() {
    if (!locked) {
      clearAnswers(currentProjectId ?? undefined);
    }
    router.push("/");
  }

  if (!currentProjectId) {
    return (
      <main className="min-h-screen flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="font-[var(--font-playfair)] text-xl">
            Select a project first
          </h1>
          <p className="text-sm text-black/70 leading-relaxed">
            Create or select a project from your Account so your quiz answers are saved to the right place.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide hover:bg-black/90 transition"
          >
            Account & projects
          </Link>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="min-h-screen flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-md text-center space-y-3">
          <h1 className="font-[var(--font-playfair)] text-xl">
            Something went wrong
          </h1>
          <p className="text-sm text-black/70">
            Please refresh the page to restart.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center px-4 py-4 md:py-10">
      <div className="w-full max-w-md md:max-w-xl flex flex-col gap-6">
        {/* Context */}
        <section className="space-y-2">
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Step 1 of 3 — Scope
          </p>
          <h1 className="font-[var(--font-playfair)] text-xl md:text-2xl leading-snug">
            Let&apos;s set your project parameters.
          </h1>
          <p className="text-xs md:text-sm text-black/70 leading-relaxed">
            We&apos;ll start with who the home is for, timeline, and the rooms
            you&apos;re touching so recommendations later are grounded and
            realistic.
          </p>
        </section>

        {/* Progress */}
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

        {/* Question */}
        <section className="space-y-2">
          <h2 className="font-[var(--font-playfair)] text-2xl leading-snug">
            {question.title}
          </h2>
          {question.subtitle ? (
            <p className="text-xs md:text-sm text-black/70">
              {question.subtitle}
            </p>
          ) : null}
        </section>

        {/* Options */}
        <section className="mt-2">
          <QuestionOptions
            question={question}
            selected={answers[question.id] ?? []}
            onSelect={toggleOption}
            answers={answers}
            onAnswersChange={setAnswers} // ✅ now supported by component
            readOnly={locked}
          />
        </section>

        {/* Footer */}
        <footer className="mt-auto pt-4">
          <div
            className="
              fixed inset-x-0 bottom-0 z-20 bg-[#F8F5EE]/95 border-t border-black/10 px-4 py-3
              md:static md:bg-transparent md:border-t-0 md:px-0 md:py-0
              md:flex md:items-center md:justify-between
            "
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleExit}
                className="w-full md:w-auto text-center text-xs md:text-sm px-4 py-2 rounded-full border border-black/20 bg-transparent hover:bg-black/5 transition"
              >
                Exit
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="w-full md:w-auto text-xs md:text-sm px-4 py-2 rounded-full border border-black/20 disabled:opacity-40 bg-transparent hover:bg-black/5 transition"
              >
                Back
              </button>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className="mt-2 md:mt-0 w-full md:w-auto text-xs md:text-sm px-6 py-2 rounded-full bg-black text-[#F8F5EE] disabled:opacity-40 hover:bg-black/90 transition"
            >
              {isLast ? "Continue to budget" : "Next"}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
