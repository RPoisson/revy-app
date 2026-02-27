// Multi-project persistence. Projects are stored in localStorage keyed by id.
// Each project has: id, name, status. Current project id is stored separately.

export type ProjectStatus = "draft" | "in_progress" | "complete";

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string; // ISO
};

const PROJECTS_KEY = "revy.projects.v1";
const CURRENT_PROJECT_KEY = "revy.currentProjectId.v1";

function genId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p: unknown) =>
        p &&
        typeof p === "object" &&
        typeof (p as Project).id === "string" &&
        typeof (p as Project).name === "string" &&
        ["draft", "in_progress", "complete"].includes((p as Project).status)
    );
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

export function getCurrentProjectId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CURRENT_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentProjectId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id == null) {
      window.localStorage.removeItem(CURRENT_PROJECT_KEY);
    } else {
      window.localStorage.setItem(CURRENT_PROJECT_KEY, id);
    }
  } catch {
    // ignore
  }
}

export function createProject(name: string): Project {
  const projects = getProjects();
  const project: Project = {
    id: genId(),
    name: name.trim() || "Untitled project",
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  projects.unshift(project);
  saveProjects(projects);
  setCurrentProjectId(project.id);
  return project;
}

export function updateProject(id: string, updates: Partial<Pick<Project, "name" | "status">>) {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return;
  projects[idx] = { ...projects[idx], ...updates };
  saveProjects(projects);
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}
