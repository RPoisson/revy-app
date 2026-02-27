// src/app/quiz/lib/answersStore.ts
// Project-scoped: answers are stored per project. Pass projectId for multi-project support.

export type QuizAnswers = Record<string, string[]>;

const STORAGE_PREFIX = "revy.quizAnswers.v1";

function storageKey(projectId: string | null | undefined): string {
  if (projectId) return `${STORAGE_PREFIX}.${projectId}`;
  return STORAGE_PREFIX; // legacy / no project selected
}

export function getAnswers(projectId?: string | null): QuizAnswers {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);

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

export function saveAnswers(answers: QuizAnswers, projectId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(projectId), JSON.stringify(answers));
  } catch {
    // ignore write errors (private mode / quota)
  }
}

export function clearAnswers(projectId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(projectId));
  } catch {
    // ignore
  }
}
