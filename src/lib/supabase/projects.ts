/**
 * Supabase-backed project and org helpers.
 * Used when NEXT_PUBLIC_SUPABASE_URL is set and user is logged in.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type ProjectRow = {
  id: string;
  organization_id: string;
  user_id: string;
  name: string;
  status: "draft" | "in_progress" | "complete" | "archived";
  designs_created_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectRecord = ProjectRow;

export async function getPersonalOrgId(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("type", "personal")
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[Revy] getPersonalOrgId error:", error.message);
    return null;
  }
  if (!data) {
    console.warn("[Revy] No personal org found for current user");
    return null;
  }
  return data.id;
}

export async function fetchProjects(
  supabase: SupabaseClient
): Promise<ProjectRecord[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as ProjectRecord[];
}

export async function createProject(
  supabase: SupabaseClient,
  name: string
): Promise<ProjectRecord | null> {
  const orgId = await getPersonalOrgId(supabase);
  if (!orgId) return null;

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  if (!user) return null;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      organization_id: orgId,
      user_id: user.id,
      name: name.trim() || "Untitled project",
      status: "draft",
    })
    .select()
    .single();
  if (error) {
    console.error("[Revy] createProject insert error:", error.message, error.details);
    return null;
  }
  return data as ProjectRecord;
}

export async function updateProject(
  supabase: SupabaseClient,
  id: string,
  updates: { name?: string; status?: ProjectRecord["status"] }
): Promise<boolean> {
  const { error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

export async function deleteProject(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  return !error;
}

export async function setDesignsCreated(
  supabase: SupabaseClient,
  projectId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("projects")
    .update({
      designs_created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);
  return !error;
}

export async function getDesignsCreated(
  supabase: SupabaseClient,
  projectId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("projects")
    .select("designs_created_at")
    .eq("id", projectId)
    .single();
  if (error || !data) return false;
  return !!data.designs_created_at;
}
