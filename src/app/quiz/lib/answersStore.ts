// src/app/quiz/lib/answersStore.ts

export type QuizAnswers = Record<string, string[]>;

const STORAGE_KEY = "revy.quizAnswers.v1";

export function getAnswers(): QuizAnswers {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);

    // Defensive: ensure Record<string, string[]>
    if (!parsed || typeof parsed !== "object") return {};
    const out: QuizAnswers = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function saveAnswers(answers: QuizAnswers) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // ignore write errors (private mode / quota)
  }
}

export function clearAnswers() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
