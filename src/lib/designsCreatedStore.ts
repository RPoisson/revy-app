// Tracks whether designs have been generated for each project.
// Set when user clicks "Create Designs" on the Project Plan (brief) page.

const STORAGE_KEY = "revy.designsCreated.v1";

function load(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k === "string" && v === true) out[k] = true;
    }
    return out;
  } catch {
    return {};
  }
}

function save(data: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getDesignsCreated(projectId: string | null | undefined): boolean {
  if (!projectId) return false;
  return load()[projectId] === true;
}

export function setDesignsCreated(projectId: string | null | undefined, value: boolean): void {
  if (!projectId) return;
  const data = load();
  if (value) {
    data[projectId] = true;
  } else {
    delete data[projectId];
  }
  save(data);
}
