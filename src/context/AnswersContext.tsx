"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  getProjectAnswers,
  saveProjectAnswers,
  type QuizAnswers,
} from "@/lib/supabase/answers";

type AnswersContextValue = {
  getAnswers: (projectId: string | null | undefined) => QuizAnswers;
  saveAnswers: (answers: QuizAnswers, projectId: string | null | undefined) => void;
  clearAnswers: (projectId: string | null | undefined) => void;
  loadAnswersFromSupabase: (projectId: string) => Promise<void>;
  loadingProjectId: string | null;
};

const AnswersContext = createContext<AnswersContextValue | null>(null);

export function AnswersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [cache, setCache] = useState<Record<string, QuizAnswers>>({});
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const loadedRef = useRef<Set<string>>(new Set());

  const loadAnswersFromSupabase = useCallback(
    async (projectId: string) => {
      if (loadedRef.current.has(projectId)) return;
      setLoadingProjectId(projectId);
      const answers = await getProjectAnswers(supabase, projectId);
      setCache((prev) => ({ ...prev, [projectId]: answers }));
      loadedRef.current.add(projectId);
      setLoadingProjectId(null);
    },
    [supabase]
  );

  const getAnswers = useCallback(
    (projectId: string | null | undefined): QuizAnswers => {
      if (!projectId) return {};
      // Trigger async load if we haven't loaded this project yet
      if (!loadedRef.current.has(projectId)) {
        loadAnswersFromSupabase(projectId);
      }
      return cache[projectId] ?? {};
    },
    [cache, loadAnswersFromSupabase]
  );

  const saveAnswers = useCallback(
    (answers: QuizAnswers, projectId: string | null | undefined) => {
      if (!projectId || !user) return;
      // Update cache immediately
      setCache((prev) => ({ ...prev, [projectId]: answers }));
      loadedRef.current.add(projectId);
      // Persist to Supabase (fire-and-forget, but log errors)
      saveProjectAnswers(supabase, projectId, user.id, answers).catch((err) =>
        console.error("Failed to save answers:", err)
      );
    },
    [supabase, user]
  );

  const clearAnswers = useCallback(
    (projectId: string | null | undefined) => {
      if (!projectId || !user) return;
      setCache((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      loadedRef.current.delete(projectId);
      // Save empty answers to Supabase
      saveProjectAnswers(supabase, projectId, user.id, {}).catch((err) =>
        console.error("Failed to clear answers:", err)
      );
    },
    [supabase, user]
  );

  const value = useMemo<AnswersContextValue>(
    () => ({
      getAnswers,
      saveAnswers,
      clearAnswers,
      loadAnswersFromSupabase,
      loadingProjectId,
    }),
    [getAnswers, saveAnswers, clearAnswers, loadAnswersFromSupabase, loadingProjectId]
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
