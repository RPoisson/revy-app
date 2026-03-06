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
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  fetchProjects,
  createProject as createProjectInDb,
  updateProject as updateProjectInDb,
  deleteProject as deleteProjectInDb,
  type ProjectRecord,
} from "@/lib/supabase/projects";

export type Project = {
  id: string;
  name: string;
  status: "draft" | "in_progress" | "complete" | "archived";
  createdAt: string;
  designsCreatedAt: string | null;
};

function toProject(row: ProjectRecord): Project {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    designsCreatedAt: row.designs_created_at,
  };
}

const CURRENT_PROJECT_KEY = "revy.currentProjectId.v1";

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
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(CURRENT_PROJECT_KEY);
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }
    const rows = await fetchProjects(supabase);
    const mapped = rows.map(toProject);
    setProjects(mapped);
    // If currentId is no longer in the list, reset
    if (currentId && !mapped.some((p) => p.id === currentId)) {
      const first = mapped[0]?.id ?? null;
      setCurrentId(first);
      if (typeof window !== "undefined") {
        if (first) window.localStorage.setItem(CURRENT_PROJECT_KEY, first);
        else window.localStorage.removeItem(CURRENT_PROJECT_KEY);
      }
    }
  }, [user, supabase, currentId]);

  useEffect(() => {
    refresh();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const setCurrent = useCallback((id: string | null) => {
    setCurrentId(id);
    if (typeof window !== "undefined") {
      if (id == null) window.localStorage.removeItem(CURRENT_PROJECT_KEY);
      else window.localStorage.setItem(CURRENT_PROJECT_KEY, id);
    }
  }, []);

  const createProject = useCallback(
    async (name: string): Promise<Project | null> => {
      const row = await createProjectInDb(supabase, name);
      if (!row) return null;
      const project = toProject(row);
      setProjects((prev) => [project, ...prev]);
      setCurrent(project.id);
      return project;
    },
    [supabase, setCurrent]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<Pick<Project, "name" | "status">>) => {
      await updateProjectInDb(supabase, id, updates);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    [supabase]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      await deleteProjectInDb(supabase, id);
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (currentId === id) {
          const first = next[0]?.id ?? null;
          setCurrent(first);
        }
        return next;
      });
    },
    [supabase, currentId, setCurrent]
  );

  const getDesignsCreated = useCallback(
    (projectId: string | null | undefined): boolean => {
      if (!projectId) return false;
      const p = projects.find((proj) => proj.id === projectId);
      return !!p?.designsCreatedAt;
    },
    [projects]
  );

  const setDesignsCreated = useCallback(
    async (projectId: string | null | undefined, value: boolean) => {
      if (!projectId) return;
      if (value) {
        const { setDesignsCreated: setInDb } = await import("@/lib/supabase/projects");
        await setInDb(supabase, projectId);
      }
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, designsCreatedAt: value ? new Date().toISOString() : null }
            : p
        )
      );
    },
    [supabase]
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
    }),
    [projects, currentId, setCurrent, createProject, updateProject, refresh, deleteProject, getDesignsCreated, setDesignsCreated]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
