/**
 * Supabase-backed project answers (quiz answers).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type QuizAnswers = Record<string, string[]>;

export async function getProjectAnswers(
  supabase: SupabaseClient,
  projectId: string
): Promise<QuizAnswers> {
  const { data, error } = await supabase
    .from("project_answers")
    .select("answers")
    .eq("project_id", projectId)
    .single();
  if (error || !data?.answers || typeof data.answers !== "object") return {};
  const raw = data.answers as Record<string, unknown>;
  const out: QuizAnswers = {};
  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) out[k] = v;
  }
  return out;
}

export async function saveProjectAnswers(
  supabase: SupabaseClient,
  projectId: string,
  userId: string,
  answers: QuizAnswers
): Promise<boolean> {
  const { error } = await supabase.from("project_answers").upsert(
    {
      project_id: projectId,
      user_id: userId,
      answers,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "project_id" }
  );
  return !error;
}
