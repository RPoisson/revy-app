"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getAnswers,
  saveAnswers as saveAnswersLocal,
  clearAnswers as clearAnswersLocal,
  type QuizAnswers,
} from "@/app/quiz/lib/answersStore";

type AnswersContextValue = {
  getAnswers: (projectId: string | null | undefined) => QuizAnswers;
  saveAnswers: (answers: QuizAnswers, projectId: string | null | undefined) => void;
  clearAnswers: (projectId: string | null | undefined) => void;
  loadAnswersFromSupabase: (_projectId: string) => Promise<void>;
  loadingProjectId: null;
};

const AnswersContext = createContext<AnswersContextValue | null>(null);

export function AnswersProvider({ children }: { children: ReactNode }) {
  // Supabase-backed answers are intentionally disabled for now.
  // Keep API surface stable so we can re-enable later without refactors.
  const [cache] = useState<Record<string, QuizAnswers>>({});
  const loadAnswersFromSupabase = useCallback(async (_projectId: string) => {}, []);

  const getAnswers = useCallback(
    (projectId: string | null | undefined): QuizAnswers => {
      if (!projectId) return {};
      return getAnswers(projectId);
    },
    [cache]
  );

  const saveAnswers = useCallback(
    (answers: QuizAnswers, projectId: string | null | undefined) => {
      if (!projectId) return;
      saveAnswersLocal(answers, projectId);
    },
    []
  );

  const clearAnswers = useCallback(
    (projectId: string | null | undefined) => {
      if (!projectId) return;
      clearAnswersLocal(projectId);
    },
    []
  );

  const value = useMemo<AnswersContextValue>(
    () => ({
      getAnswers,
      saveAnswers,
      clearAnswers,
      loadAnswersFromSupabase,
      loadingProjectId: null,
    }),
    [getAnswers, saveAnswers, clearAnswers, loadAnswersFromSupabase]
  );

  return (
    <AnswersContext.Provider value={value}>{children}</AnswersContext.Provider>
  );
}

export function useAnswers() {
  const ctx = useContext(AnswersContext);
  if (!ctx) throw new Error("useAnswers must be used within AnswersProvider");
  return ctx;
}
