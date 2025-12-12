// src/app/quiz/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { QUESTIONS, Question, Option } from "@/questions";
import { scoreQuiz, Answers as ScoringAnswers } from "@/app/scoring";
import {
  generateResultText,
  GeneratedResultText,
} from "@/app/resultText";

type QuizAnswers = Record<string, string[]>;

export default function QuizPage() {
  // 🔐 Simple client-side auth gate
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [completed, setCompleted] = useState(false);

  // Check sessionStorage flag set by /login
  useEffect(() => {
    if (typeof window === "undefined") return;
    const authed = window.sessionStorage.getItem("revy_quiz_authed");
    if (!authed) {
      window.location.href = "/login";
      return;
    }
    setCheckedAuth(true);
  }, []);

  // Smooth scroll to top on each question change (after auth)
  useEffect(() => {
    if (!checkedAuth) return;
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [step, checkedAuth]);

  const total = QUESTIONS.length;
  const question = QUESTIONS[step] ?? null;
  const progress = question ? ((step + 1) / total) * 100 : 0;
  const isLast = step === total - 1;

  function toggleOption(q: Question, optionId: string) {
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];
      if (q.allowMultiple) {
        const exists = current.includes(optionId);
        const next = exists
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [q.id]: next };
      } else {
        return { ...prev, [q.id]: [optionId] };
      }
    });
  }

  function handleNext() {
    if (!question) return;

    if (!isLast) {
      setStep((s) => s + 1);
    } else {
      setCompleted(true);
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  const canGoNext = useMemo(() => {
    if (!question) return false;
    const current = answers[question.id] ?? [];
    // If you want to require an answer, change to: return current.length > 0;
    return true || current.length > 0;
  }, [answers, question]);

  // While we haven't confirmed auth, render nothing
  if (!checkedAuth) {
    return null;
  }

  // Defensive guard: if something goes wrong with indexing
  if (!completed && !question) {
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
            Please refresh the page to restart your style quiz.
          </p>
        </div>
      </main>
    );
  }

  if (completed && question) {
    // Convert quiz answers into the shape scoring/resultText expect
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
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Studio Rêvy™
          </p>

          <h1 className="font-[var(--font-playfair)] text-xl md:text-2xl leading-snug">
            {question.title}
          </h1>

          {/* Room Design section */}
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

          {/* Title section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
              Title
            </h2>
            <p className="text-lg text-black">{title}</p>
          </section>

          {/* Description section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
              Description
            </h2>
            <p className="text-sm leading-relaxed text-black/80">
              {description}
            </p>
          </section>
        </div>
      </main>
    );
  }

  // Main quiz flow
  return (
    <main className="min-h-screen flex justify-center px-4 py-4 md:py-10">
      <div className="w-full max-w-md md:max-w-xl flex flex-col gap-6">
        {/* Progress */}
        <header className="space-y-2">
          <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-black/60">
            <span>
              Question {question!.index} of {total}
            </span>
            <span>Studio Rêvy™</span>
          </div>
        </header>

        {/* Question text */}
        <section className="space-y-2">
          <h1 className="font-[var(--font-playfair)] text-2xl leading-snug">
            {question!.title}
          </h1>
          {question!.subtitle && (
            <p className="text-xs md:text-sm text-black/70">
              {question!.subtitle}
            </p>
          )}
        </section>

        {/* Options */}
        <section className="mt-2">
          <QuestionOptions
            question={question!}
            selected={answers[question!.id] ?? []}
            onSelect={toggleOption}
          />
        </section>

        {/* Nav */}
        <footer className="mt-auto pt-4">
          <div
            className="
              fixed inset-x-0 bottom-0 z-20 bg-[#F8F5EE]/95 border-t border-black/10 px-4 py-3
              md:static md:bg-transparent md:border-t-0 md:px-0 md:py-0
              md:flex md:items-center md:justify-between
            "
          >
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="w-full md:w-auto text-xs md:text-sm px-4 py-2 rounded-full border border-black/20 disabled:opacity-40 bg-transparent hover:bg-black/5 transition"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="mt-2 md:mt-0 w-full md:w-auto text-xs md:text-sm px-6 py-2 rounded-full bg-black text-[#F8F5EE] disabled:opacity-40 hover:bg-black/90 transition"
            >
              {isLast ? "See my style" : "Next"}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}

function QuestionOptions({
  question,
  selected,
  onSelect,
}: {
  question: Question;
  selected: string[];
  onSelect: (q: Question, optionId: string) => void;
}) {
  const isQ1 = question.id === "spaces_appeal";

  // Layout:
  // - Q1: dense grid (27 images)
  // - All others: stacked cards
  const layoutClasses =
    question.type === "multi-image" && isQ1
      ? "grid grid-cols-2 gap-2 md:gap-3 md:grid-cols-3 max-h-[70vh] overflow-y-auto pr-1"
      : "flex flex-col gap-3 md:gap-4";

  return (
    <div className={layoutClasses}>
      {question.options.map((opt: Option) => {
        const isActive = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(question, opt.id)}
            className={`relative overflow-hidden rounded-2xl bg-white shadow-sm text-left transition transform appearance-none focus:outline-none ${
              isActive
                ? "ring-2 ring-black scale-[0.99]"
                : "hover:scale-[1.01] hover:shadow-md"
            }`}
          >
            <div className="p-3 pb-0">
              <p className="text-sm md:text-base font-[var(--font-playfair)] text-black">
                {opt.label}
              </p>
              {opt.subtitle && (
                <p className="mt-1 text-xs md:text-sm text-black/60">
                  {opt.subtitle}
                </p>
              )}
            </div>

            {opt.imageUrl && (
              <img
                src={opt.imageUrl}
                alt={opt.label}
                className="w-full aspect-[2/3] object-cover rounded-2xl"
              />
            )}

            {question.allowMultiple && question.id !== "spaces_appeal" && (
              <span className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-[10px] text-[#F8F5EE]">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
