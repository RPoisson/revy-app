"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getProjects,
  getCurrentProjectId,
  setCurrentProjectId,
  createProject as createProjectInStore,
  updateProject as updateProjectInStore,
  type Project,
  type ProjectStatus,
} from "@/lib/projectStore";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import * as supabaseProjects from "@/lib/supabase/projects";

const CURRENT_PROJECT_KEY = "revy.currentProjectId.v1";

function mapSupabaseToProject(row: supabaseProjects.ProjectRecord): Project {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    designsCreated: !!row.designs_created_at,
  };
}

type ProjectContextValue = {
  projects: Project[];
  currentProject: Project | null;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  createProject: (name: string) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Pick<Project, "name" | "status">>) => void;
  refresh: () => void;
  deleteProject: (id: string) => void;
  getDesignsCreated: (projectId: string | null | undefined) => boolean;
  setDesignsCreated: (projectId: string | null | undefined, value: boolean) => void;
  useSupabase: boolean;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const useSupabase =
    typeof window !== "undefined" &&
    !!user &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const refresh = useCallback(async () => {
    if (useSupabase && user) {
      try {
        const supabase = createClient();
        const rows = await supabaseProjects.fetchProjects(supabase);
        setProjects(rows.map(mapSupabaseToProject));
        const stored = typeof window !== "undefined" ? window.localStorage.getItem(CURRENT_PROJECT_KEY) : null;
        const id = stored && rows.some((r) => r.id === stored) ? stored : rows[0]?.id ?? null;
        if (id) setCurrentProjectId(id);
        setCurrentId(id);
      } catch {
        setProjects([]);
        setCurrentId(null);
      }
      return;
    }
    setProjects(getProjects());
    setCurrentId(getCurrentProjectId());
  }, [user, useSupabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setCurrent = useCallback(
    (id: string | null) => {
      if (typeof window !== "undefined") {
        if (id == null) window.localStorage.removeItem(CURRENT_PROJECT_KEY);
        else window.localStorage.setItem(CURRENT_PROJECT_KEY, id);
      }
      setCurrentId(id);
    },
    []
  );

  const createProject = useCallback(
    (name: string): Promise<Project | null> => {
      if (useSupabase && user) {
        const supabase = createClient();
        return supabaseProjects.createProject(supabase, name).then((row) => {
          if (!row) return null;
          const project = mapSupabaseToProject(row);
          setProjects((prev) => [project, ...prev]);
          setCurrentId(project.id);
          setCurrent(project.id);
          return project;
        });
      }
      const project = createProjectInStore(name);
      setProjects(getProjects());
      setCurrentId(project.id);
      return Promise.resolve(project);
    },
    [user, useSupabase, setCurrent]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Pick<Project, "name" | "status">>) => {
      if (useSupabase) {
        const supabase = createClient();
        supabaseProjects.updateProject(supabase, id, updates);
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
        return;
      }
      updateProjectInStore(id, updates);
      setProjects(getProjects());
    },
    [useSupabase]
  );

  const deleteProject = useCallback(
    (id: string) => {
      if (useSupabase) {
        const supabase = createClient();
        supabaseProjects.deleteProject(supabase, id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (currentId === id) {
          const next = projects.find((p) => p.id !== id);
          const nextId = next?.id ?? null;
          setCurrent(nextId);
        }
        return;
      }
      const { deleteProject: deleteProjectInStore } = require("@/lib/projectStore") as typeof import("@/lib/projectStore");
      deleteProjectInStore(id);
      setProjects(getProjects());
      setCurrentId(getCurrentProjectId());
    },
    [useSupabase, currentId, projects, setCurrent]
  );

  const getDesignsCreated = useCallback(
    (projectId: string | null | undefined): boolean => {
      if (!projectId) return false;
      if (useSupabase) {
        const p = projects.find((x) => x.id === projectId);
        return p?.designsCreated ?? false;
      }
      return require("@/lib/designsCreatedStore").getDesignsCreated(projectId);
    },
    [useSupabase, projects]
  );

  const setDesignsCreated = useCallback(
    (projectId: string | null | undefined, value: boolean) => {
      if (!projectId) return;
      if (useSupabase && value) {
        const supabase = createClient();
        supabaseProjects.setDesignsCreated(supabase, projectId);
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, designsCreated: true } : p))
        );
        return;
      }
      if (!useSupabase) {
        require("@/lib/designsCreatedStore").setDesignsCreated(projectId, value);
      }
    },
    [useSupabase]
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      projects,
      currentProject: currentId ? projects.find((p) => p.id === currentId) ?? null : null,
      currentProjectId: currentId,
      setCurrentProjectId: setCurrent,
      createProject,
      updateProject,
      refresh,
      deleteProject,
      getDesignsCreated,
      setDesignsCreated,
      useSupabase: !!useSupabase,
    }),
    [projects, currentId, setCurrent, createProject, updateProject, refresh, deleteProject, getDesignsCreated, setDesignsCreated, useSupabase]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
