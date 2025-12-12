// src/app/quiz/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { QUESTIONS, Question, Option } from "@/questions";
import { scoreQuiz } from "@/app/scoring";
import { generateResultText } from "@/app/resultText";

type Answers = Record<string, string[]>;

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [completed, setCompleted] = useState(false);

  const question = QUESTIONS[step];
  const total = QUESTIONS.length;
  const progress = ((step + 1) / total) * 100;
  const isLast = step === total - 1;

  // Scroll to top on each step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

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
    if (!isLast) {
      setStep((s) => s + 1);
    } else {
      console.log("Quiz complete:", answers);
      setCompleted(true);
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  const canGoNext = useMemo(() => {
    const current = answers[question.id] ?? [];
    // if you want to require answers, change to: return current.length > 0;
    return true || current.length > 0;
  }, [answers, question.id]);

  if (completed) {
    const styleResult = scoreQuiz(answers);
    const resultText = generateResultText(styleResult, answers as any);
    const { roomDesign, title, description } = resultText as any;

    return (
      <main className="flex-1 flex justify-center px-4 py-10">
        <div className="w-full max-w-xl space-y-8">
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Studio Rêvy
          </p>

          <h1 className="font-[var(--font-playfair)] text-3xl leading-tight">
            Your bathroom style story
          </h1>

          {/* Room Design section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
              Room Design
            </h2>
            <div className="text-sm text-black/80 space-y-1">
              {roomDesign?.primaryUserLabel && (
                <div>{roomDesign.primaryUserLabel}</div>
              )}
              {roomDesign?.vanityLabel && <div>{roomDesign.vanityLabel}</div>}
              {roomDesign?.bathingLabel && <div>{roomDesign.bathingLabel}</div>}
            </div>
          </section>

          {/* Title section */}
          <section className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
              Title
            </h2>
            <p className="text-lg font-semibold text-black">{title}</p>
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

  return (
    <main className="flex-1 flex justify-center px-4 py-6 md:py-10">
      <div className="w-full max-w-xl flex flex-col gap-6">
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
              Question {question.index} of {total}
            </span>
            <span>Studio Rêvy</span>
          </div>
        </header>

        {/* Question text */}
        <section className="space-y-2">
          <h1 className="font-[var(--font-playfair)] text-2xl leading-snug">
            {question.title}
          </h1>
          {question.subtitle && (
            <p className="text-sm text-black/70">{question.subtitle}</p>
          )}
        </section>

        {/* Options */}
        <section className="mt-2">
          <QuestionOptions
            question={question}
            selected={answers[question.id] ?? []}
            onSelect={toggleOption}
          />
        </section>

        {/* Nav */}
        <footer className="mt-auto flex items-center justify-between pt-4">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="text-xs md:text-sm px-4 py-2 rounded-full border border-black/20 disabled:opacity-40 bg-transparent hover:bg-black/5 transition"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="text-xs md:text-sm px-6 py-2 rounded-full bg-black text-[#F8F5EE] disabled:opacity-40 hover:bg-black/90 transition"
          >
            {isLast ? "See my style" : "Next"}
          </button>
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
      ? "grid grid-cols-2 gap-3 md:grid-cols-3 max-h-[70vh] overflow-y-auto pr-1"
      : "flex flex-col gap-4";

  return (
    <div className={layoutClasses}>
      {question.options.map((opt: Option) => {
        const isActive = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(question, opt.id)}
            className={`relative overflow-hidden rounded-2xl bg-white shadow-sm text-left transition transform ${
              isActive
                ? "ring-2 ring-black scale-[0.99]"
                : "hover:scale-[1.01] hover:shadow-md"
            }`}
          >
            <div className="relative">
              {opt.imageUrl && (
                <img
                  src={opt.imageUrl}
                  alt={opt.label}
                  className="w-full aspect-[2/3] object-cover"
                />
              )}

              {/* Label bar at the TOP of the image */}
              <div className="absolute top-0 left-0 right-0 bg-black/50 px-3 py-2">
                <p className="text-xs md:text-sm font-medium text-white">
                  TOP LABEL {opt.label}
                </p>
                {opt.subtitle && (
                  <p className="mt-0.5 text-[10px] md:text-xs text-white/80">
                    {opt.subtitle}
                  </p>
                )}
              </div>
            </div>

            {question.allowMultiple && (
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
