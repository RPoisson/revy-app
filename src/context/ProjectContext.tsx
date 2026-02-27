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

type ProjectContextValue = {
  projects: Project[];
  currentProject: Project | null;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  createProject: (name: string) => Project;
  updateProject: (id: string, updates: Partial<Pick<Project, "name" | "status">>) => void;
  refresh: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setProjects(getProjects());
    setCurrentId(getCurrentProjectId());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setCurrent = useCallback((id: string | null) => {
    setCurrentProjectId(id);
    setCurrentId(id);
  }, []);

  const createProject = useCallback((name: string) => {
    const project = createProjectInStore(name);
    setProjects(getProjects());
    setCurrentId(project.id);
    return project;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Pick<Project, "name" | "status">>) => {
    updateProjectInStore(id, updates);
    setProjects(getProjects());
  }, []);

  const value = useMemo<ProjectContextValue>(
    () => ({
      projects,
      currentProject: currentId ? projects.find((p) => p.id === currentId) ?? null : null,
      currentProjectId: currentId,
      setCurrentProjectId: setCurrent,
      createProject,
      updateProject,
      refresh,
    }),
    [projects, currentId, setCurrent, createProject, updateProject, refresh]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
