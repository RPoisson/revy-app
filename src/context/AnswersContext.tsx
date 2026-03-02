"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { createClient } from "@/lib/supabase/client";
import * as supabaseAnswers from "@/lib/supabase/answers";
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
  loadAnswersFromSupabase: (projectId: string) => Promise<void>;
  /** When using Supabase, set while loading answers for this project id */
  loadingProjectId: string | null;
};

const AnswersContext = createContext<AnswersContextValue | null>(null);

export function AnswersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentProjectId } = useProjects();
  const [cache, setCache] = useState<Record<string, QuizAnswers>>({});
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);

  const supabaseEnabled =
    process.env.NEXT_PUBLIC_SUPABASE_AUTH_ENABLED === "true" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const useSupabaseForAnswers =
    supabaseEnabled && !!user;

  const loadAnswersFromSupabase = useCallback(async (projectId: string) => {
    if (!useSupabaseForAnswers) return;
    setLoadingProjectId(projectId);
    try {
      const supabase = createClient();
      const answers = await supabaseAnswers.getProjectAnswers(supabase, projectId);
      setCache((prev) => ({ ...prev, [projectId]: answers }));
    } catch {
      setCache((prev) => ({ ...prev, [projectId]: {} }));
    } finally {
      setLoadingProjectId((id) => (id === projectId ? null : id));
    }
  }, [useSupabaseForAnswers]);

  useEffect(() => {
    if (currentProjectId && useSupabaseForAnswers) {
      loadAnswersFromSupabase(currentProjectId);
    }
  }, [currentProjectId, useSupabaseForAnswers, loadAnswersFromSupabase]);

  const getAnswers = useCallback(
    (projectId: string | null | undefined): QuizAnswers => {
      if (!projectId) return {};
      if (useSupabaseForAnswers && projectId in cache) return cache[projectId];
      if (useSupabaseForAnswers) return {};
      return getAnswers(projectId);
    },
    [useSupabaseForAnswers, cache]
  );

  const saveAnswers = useCallback(
    (answers: QuizAnswers, projectId: string | null | undefined) => {
      if (!projectId) return;
      if (useSupabaseForAnswers && user) {
        const supabase = createClient();
        supabaseAnswers.saveProjectAnswers(supabase, projectId, user.id, answers);
        setCache((prev) => ({ ...prev, [projectId]: answers }));
        return;
      }
      saveAnswersLocal(answers, projectId);
    },
    [useSupabaseForAnswers, user]
  );

  const clearAnswers = useCallback(
    (projectId: string | null | undefined) => {
      if (!projectId) return;
      if (useSupabaseForAnswers && user) {
        const supabase = createClient();
        supabaseAnswers.saveProjectAnswers(supabase, projectId, user.id, {});
        setCache((prev) => ({ ...prev, [projectId]: {} }));
        return;
      }
      clearAnswersLocal(projectId);
    },
    [useSupabaseForAnswers, user]
  );

  const value: AnswersContextValue = {
    getAnswers,
    saveAnswers,
    clearAnswers,
    loadAnswersFromSupabase,
    loadingProjectId: useSupabaseForAnswers ? loadingProjectId : null,
  };

  return (
    <AnswersContext.Provider value={value}>{children}</AnswersContext.Provider>
  );
}

export function useAnswers() {
  const ctx = useContext(AnswersContext);
  if (!ctx) throw new Error("useAnswers must be used within AnswersProvider");
  return ctx;
}
