/**
 * Supabase-backed design output (replaces designConceptStore + designsCreatedStore).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getDesignOutput(
  supabase: SupabaseClient,
  projectId: string
): Promise<{ output: Record<string, unknown>; designsCreated: boolean } | null> {
  const { data, error } = await supabase
    .from("project_design_output")
    .select("output, designs_created")
    .eq("project_id", projectId)
    .single();
  if (error || !data) return null;
  return {
    output: (data.output as Record<string, unknown>) ?? {},
    designsCreated: !!data.designs_created,
  };
}

export async function saveDesignOutput(
  supabase: SupabaseClient,
  projectId: string,
  userId: string,
  output: Record<string, unknown>,
  designsCreated: boolean
): Promise<boolean> {
  const { error } = await supabase.from("project_design_output").upsert(
    {
      project_id: projectId,
      user_id: userId,
      output,
      designs_created: designsCreated,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "project_id" }
  );
  return !error;
}

export async function deleteDesignOutput(
  supabase: SupabaseClient,
  projectId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("project_design_output")
    .delete()
    .eq("project_id", projectId);
  return !error;
}
