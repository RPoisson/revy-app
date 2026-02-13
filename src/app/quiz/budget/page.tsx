// src/app/quiz/budget/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Question } from "@/questions";
import QuestionOptions from "@/app/quiz/components/QuestionOptions";
import { BUDGET_QUESTIONS } from "@/app/quiz/budget/questions";
import { getAnswers, saveAnswers, clearAnswers, QuizAnswers } from "@/app/quiz/lib/answersStore";

export default function BudgetPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(() => getAnswers());

  const total = BUDGET_QUESTIONS.length;
  const question = BUDGET_QUESTIONS[step];

  const safeProgress = total > 0 ? ((step + 1) / total) * 100 : 0;
  const isLast = step === total - 1;

  useEffect(() => {
    saveAnswers(answers);
  }, [answers]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  function toggleOption(q: Question, optionId: string) {
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];
      if (q.allowMultiple) {
        const exists = current.includes(optionId);
        const nextSelected = exists
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [q.id]: nextSelected };
      }
      return { ...prev, [q.id]: [optionId] };
    });
  }

  function handleNext() {
    if (!question) return;
    if (!isLast) setStep((s) => s + 1);
    else router.push("/quiz");
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
    else router.push("/quiz/scope");
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

  if (!question) {
    return (
      <main className="min-h-screen flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-md text-center space-y-3">
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Studio Rêvy™
          </p>
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
        {/* Page context + reassurance */}
        <section className="space-y-2">
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Step 2 of 3 — Budget
          </p>
          <h1 className="font-[var(--font-playfair)] text-xl md:text-2xl leading-snug">
            Let’s align on budget—so the design stays honest.
          </h1>
          <p className="text-xs md:text-sm text-black/70 leading-relaxed">
            Think of this as an investment range, not a final quote. We ask so
            we can recommend options that fit—without wasting your time on paths
            that don’t. You can adjust your range later.
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
          <div className="flex items-center justify-between text-[11px] text-black/60">
            <span>
              Question {step + 1} of {total}
            </span>
            <span>Studio RêvyTM</span>
          </div>
        </header>

        {/* Question */}
        <section className="space-y-2">
          <h2 className="font-[var(--font-playfair)] text-2xl leading-snug">
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="text-xs md:text-sm text-black/70">
              {question.subtitle}
            </p>
          )}
        </section>

        <section className="mt-2">
          <QuestionOptions
            question={question}
            selected={answers[question.id] ?? []}
            onSelect={toggleOption}
            answers={answers}
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
                onClick={handleExit}
                className="w-full md:w-auto text-center text-xs md:text-sm px-4 py-2 rounded-full border border-black/20 bg-transparent hover:bg-black/5 transition"
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
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="mt-2 md:mt-0 w-full md:w-auto text-xs md:text-sm px-6 py-2 rounded-full bg-black text-[#F8F5EE] disabled:opacity-40 hover:bg-black/90 transition"
            >
              {isLast ? "Continue to style" : "Next"}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
