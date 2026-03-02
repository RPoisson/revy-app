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
  createProject as createProjectInStore,
  updateProject as updateProjectInStore,
  type Project,
  type ProjectStatus,
} from "@/lib/projectStore";

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
  useSupabase: false;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setProjects(getProjects());
    setCurrentId(getCurrentProjectId());
  }, []);

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
      const project = createProjectInStore(name);
      setProjects(getProjects());
      setCurrentId(project.id);
      return Promise.resolve(project);
    },
    [setCurrent]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Pick<Project, "name" | "status">>) => {
      updateProjectInStore(id, updates);
      setProjects(getProjects());
    },
    []
  );

  const deleteProject = useCallback(
    (id: string) => {
      const { deleteProject: deleteProjectInStore } = require("@/lib/projectStore") as typeof import("@/lib/projectStore");
      deleteProjectInStore(id);
      setProjects(getProjects());
      setCurrentId(getCurrentProjectId());
    },
    [currentId, projects, setCurrent]
  );

  const getDesignsCreated = useCallback(
    (projectId: string | null | undefined): boolean => {
      if (!projectId) return false;
      return require("@/lib/designsCreatedStore").getDesignsCreated(projectId);
    },
    []
  );

  const setDesignsCreated = useCallback(
    (projectId: string | null | undefined, value: boolean) => {
      if (!projectId) return;
      require("@/lib/designsCreatedStore").setDesignsCreated(projectId, value);
    },
    []
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
      useSupabase: false,
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
