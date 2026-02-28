//revy-quiz/quiz/scope/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/questions";
import QuestionOptions from "@/app/quiz/components/QuestionOptions";
import {
  SCOPE_QUESTIONS,
  bathroomConfigKey,
  roomNamesKey,
  COUNTABLE_OPTION_IDS,
  ROOM_OPTION_LABELS,
  BATHROOM_CONFIG_ROOM_IDS,
  BATHROOM_CONFIG_OPTIONS,
} from "@/app/quiz/scope/questions";
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

/** Parse room count from qty answer; "7_plus" => 7. */
function getRoomCount(answers: QuizAnswers, roomId: string): number {
  const v = answers[qtyKey(roomId)]?.[0];
  if (v === "7_plus") return 7;
  return Math.max(1, parseInt(String(v ?? "1"), 10) || 1);
}

const COUNTABLE_ROOM_IDS = new Set<string>(COUNTABLE_OPTION_IDS);

function BathroomSetupInputs({
  answers,
  onAnswersChange,
  readOnly,
}: {
  answers: QuizAnswers;
  onAnswersChange: (updater: (prev: QuizAnswers) => QuizAnswers) => void;
  readOnly: boolean;
}) {
  const rooms = (answers["rooms"] ?? []).filter((id) =>
    BATHROOM_CONFIG_ROOM_IDS.includes(id as (typeof BATHROOM_CONFIG_ROOM_IDS)[number])
  );

  function setConfigForRoom(roomId: string, configs: string[]) {
    onAnswersChange((prev) => ({ ...prev, [bathroomConfigKey(roomId)]: configs }));
  }

  return (
    <div className="space-y-8">
      {rooms.map((roomId) => {
        const count = getRoomCount(answers, roomId);
        const raw = answers[bathroomConfigKey(roomId)] ?? [];
        const configs: string[] = [...raw];
        while (configs.length < count) configs.push("");
        const names = answers[roomNamesKey(roomId)] ?? [];
        const baseLabel = ROOM_OPTION_LABELS[roomId] ?? roomId;
        return (
          <div key={roomId} className="space-y-4">
            {Array.from({ length: count }, (_, i) => {
              const instanceLabel =
                count === 1 ? baseLabel : names[i] || `${baseLabel} (${i + 1})`;
              const selected = configs[i] ?? "";
              return (
                <div key={`${roomId}-${i}`} className="rounded-lg border border-black/10 bg-white/50 p-4 space-y-3">
                  <p className="text-sm font-medium text-black/90">{instanceLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {BATHROOM_CONFIG_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          const next = [...configs];
                          next[i] = opt.id;
                          setConfigForRoom(roomId, next);
                        }}
                        disabled={readOnly}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          selected === opt.id
                            ? "border-black bg-black text-white"
                            : "border-black/20 bg-white text-black hover:bg-black/5"
                        } disabled:opacity-70`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function RoomNamesInputs({
  answers,
  onAnswersChange,
  readOnly,
  qtyKey,
}: {
  answers: QuizAnswers;
  onAnswersChange: (updater: (prev: QuizAnswers) => QuizAnswers) => void;
  readOnly: boolean;
  qtyKey: (optionId: string) => string;
}) {
  const selectedRooms = answers["rooms"] ?? [];

  function setNamesForRoom(roomId: string, names: string[]) {
    onAnswersChange((prev) => ({ ...prev, [roomNamesKey(roomId)]: names }));
  }

  return (
    <div className="space-y-6">
      {selectedRooms.map((roomId) => {
        const count = getRoomCount(answers, roomId);
        const raw = answers[roomNamesKey(roomId)] ?? [];
        const names: string[] = [...raw];
        while (names.length < count) names.push("");
        const baseLabel = ROOM_OPTION_LABELS[roomId] ?? roomId;
        return (
          <div key={roomId} className="space-y-2">
            {count === 1 ? (
              <label className="block text-sm font-medium text-black/80">
                {baseLabel}
              </label>
            ) : null}
            {Array.from({ length: count }, (_, i) => (
              <div key={`${roomId}-${i}`} className="space-y-1">
                {count > 1 ? (
                  <label className="block text-sm font-medium text-black/80">
                    {baseLabel} ({i + 1})
                  </label>
                ) : null}
                <input
                  type="text"
                  value={names[i] ?? ""}
                  onChange={(e) => {
                    const next = [...names];
                    next[i] = e.target.value;
                    setNamesForRoom(roomId, next);
                  }}
                  disabled={readOnly}
                  placeholder={count === 1 ? `e.g. ${baseLabel}` : `Name for ${baseLabel} ${i + 1}`}
                  className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:border-black/40 focus:outline-none disabled:bg-black/5 disabled:opacity-70"
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function ScopePage() {
  const router = useRouter();
  const { currentProjectId } = useProjects();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(() => getAnswers(currentProjectId ?? undefined));
  const [locked, setLocked] = useState(false);

  const visibleQuestions = useMemo(
    () =>
      SCOPE_QUESTIONS.filter(
        (q) => !q.showIf || q.showIf(answers as Record<string, string[]>)
      ),
    [answers]
  );

  const total = visibleQuestions.length;
  const question = visibleQuestions[step];

  const safeProgress = total > 0 ? ((step + 1) / total) * 100 : 0;
  const isLast = step === total - 1;

  useEffect(() => {
    setAnswers(getAnswers(currentProjectId ?? undefined));
    setLocked(getDesignsCreated(currentProjectId ?? undefined));
  }, [currentProjectId]);

  useEffect(() => {
    saveAnswers(answers, currentProjectId ?? undefined);
  }, [answers, currentProjectId]);

  // Pre-fill default room names when user lands on the "Name each space" step and names are not yet set
  useEffect(() => {
    if (question?.id !== "room_names") return;
    const rooms = answers["rooms"] ?? [];
    let updated = false;
    const next = { ...answers } as Record<string, string[]>;
    for (const roomId of rooms) {
      const count = getRoomCount(answers, roomId);
      const key = roomNamesKey(roomId);
      const current = next[key] ?? [];
      if (current.length > 0) continue; // Already have names (user may have edited)
      const baseLabel = ROOM_OPTION_LABELS[roomId] ?? roomId;
      const defaultNames = Array.from(
        { length: count },
        (_, i) => (count === 1 ? baseLabel : `${baseLabel} (${i + 1})`)
      );
      next[key] = defaultNames;
      updated = true;
    }
    if (updated) setAnswers(next as QuizAnswers);
  }, [question?.id, answers["rooms"]]);

  useEffect(() => {
    if (step >= visibleQuestions.length && visibleQuestions.length > 0) {
      setStep(visibleQuestions.length - 1);
    }
  }, [visibleQuestions.length, step]);

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

    // ✅ Room names: optional; no validation required
    if (question.id === "room_names") return true;

    // ✅ Bathroom setup: require one selection per bathroom instance
    if (question.id === "bathroom_setup") {
      const rooms = (answers["rooms"] ?? []).filter((id) =>
        BATHROOM_CONFIG_ROOM_IDS.includes(id as (typeof BATHROOM_CONFIG_ROOM_IDS)[number])
      );
      const validIds = new Set(BATHROOM_CONFIG_OPTIONS.map((o) => o.id));
      for (const roomId of rooms) {
        const count = getRoomCount(answers, roomId);
        const configs = answers[bathroomConfigKey(roomId)] ?? [];
        if (configs.length !== count) return false;
        for (let i = 0; i < count; i++) {
          const v = configs[i];
          if (!v || !validIds.has(v as (typeof BATHROOM_CONFIG_OPTIONS)[number]["id"])) return false;
        }
      }
      return true;
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

        // ✅ If unselecting a room, clear its qty, bathroom config (if bath), and room names
        if (q.id === "rooms" && exists) {
          let next: QuizAnswers = { ...prev, [q.id]: nextSelected };
          if (COUNTABLE_ROOM_IDS.has(optionId)) {
            const { [qtyKey(optionId)]: _, ...rest } = next as Record<string, string[]>;
            next = rest as QuizAnswers;
          }
          if (BATHROOM_CONFIG_ROOM_IDS.includes(optionId)) {
            const key = bathroomConfigKey(optionId);
            const { [key]: __, ...rest } = next as Record<string, string[]>;
            next = rest as QuizAnswers;
          }
          const { [roomNamesKey(optionId)]: ___, ...restNames } = next as Record<string, string[]>;
          next = restNames as QuizAnswers;
          return next;
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

        {/* Options or custom bathroom names */}
        <section className="mt-2">
          {question.id === "bathroom_setup" ? (
            <BathroomSetupInputs
              answers={answers}
              onAnswersChange={setAnswers}
              readOnly={locked}
            />
          ) : question.id === "room_names" ? (
            <RoomNamesInputs
              answers={answers}
              onAnswersChange={setAnswers}
              readOnly={locked}
              qtyKey={qtyKey}
            />
          ) : (
            <QuestionOptions
              question={question}
              selected={answers[question.id] ?? []}
              onSelect={toggleOption}
              answers={answers}
              onAnswersChange={setAnswers}
              readOnly={locked}
            />
          )}
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
