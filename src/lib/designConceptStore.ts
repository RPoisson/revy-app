// Stores the CD → PM pipeline output per project, plus optional LLM-rendered text.
// Set when user clicks "Create Designs" on the Project Plan (brief) page; read by Design Concept page.

import type { ProjectManagerSelectionOutput } from "@/app/agents/projectManagerAgent.types";

export interface DesignConceptOutput {
  pmOutput: ProjectManagerSelectionOutput;
  /** LLM-generated executive summary blocks (when available) */
  summaryBlocks?: { title: string; body: string }[];
}

const STORAGE_KEY = "revy.designConceptOutput.v2";

function load(): Record<string, DesignConceptOutput> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate from v1 (stored as ProjectManagerSelectionOutput at top level)
      const v1 = window.localStorage.getItem("revy.designConceptOutput.v1");
      if (!v1) return {};
      const parsed = JSON.parse(v1) as Record<string, unknown>;
      if (!parsed || typeof parsed !== "object") return {};
      const out: Record<string, DesignConceptOutput> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k !== "string" || !v || typeof v !== "object") continue;
        const obj = v as Record<string, unknown>;
        if ("selectionsBySlot" in obj) {
          out[k] = { pmOutput: obj as unknown as ProjectManagerSelectionOutput };
        }
      }
      return out;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, DesignConceptOutput> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k !== "string" || !v || typeof v !== "object") continue;
      const obj = v as Record<string, unknown>;
      if ("pmOutput" in obj && obj.pmOutput && typeof obj.pmOutput === "object") {
        out[k] = {
          pmOutput: obj.pmOutput as ProjectManagerSelectionOutput,
          summaryBlocks: Array.isArray(obj.summaryBlocks) ? obj.summaryBlocks as { title: string; body: string }[] : undefined,
        };
      } else if ("selectionsBySlot" in obj) {
        out[k] = { pmOutput: obj as unknown as ProjectManagerSelectionOutput };
      }
    }
    return out;
  } catch {
    return {};
  }
}

function save(data: Record<string, DesignConceptOutput>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getDesignConceptOutput(
  projectId: string | null | undefined
): DesignConceptOutput | null {
  if (!projectId) return null;
  return load()[projectId] ?? null;
}

export function setDesignConceptOutput(
  projectId: string | null | undefined,
  output: DesignConceptOutput
): void {
  if (!projectId) return;
  const data = load();
  data[projectId] = output;
  save(data);
}

export function clearDesignConceptOutput(projectId: string | null | undefined): void {
  if (!projectId) return;
  const data = load();
  delete data[projectId];
  save(data);
}
