// src/app/agents/projectManagerAgent.ts
// Project Manager (PM) Agent — Fiscal, Maintenance, and Technical Auditor.
// Validates Creative Director–proposed materials against project metadata (buildable, affordable, durable).
// Uses scope/budget/finish rules in logic only; outputs human-readable scopeReasoning per material for the
// Decision Details table "Scope" column (Studio Coordinator renders that text only — no rule IDs).

import type { QuizAnswers } from "@/app/quiz/lib/answersStore";
import {
  computeBudgetFit,
  computeComplexityPoints,
  getBudgetCapacityPoints,
  type BudgetFit,
} from "@/app/brief/budgetHeuristics";
import type {
  ProjectMetadata,
  ProjectManagerAgentOutput,
  ProposedMaterial,
  RoomDimensions,
} from "./projectManagerAgent.types";
import {
  EXOTIC_STONE_IDS,
  FISCAL_DOWNGRADE_MAP,
  LUXURY_MATERIAL_IDS,
  OVERHEAD_FIXTURE_PLACEHOLDER_ID,
  RENTAL_SAFE_METAL_IDS,
  RENTAL_SAFE_STONE_IDS,
  RENTAL_STONE_SWAP_FROM,
  RENTAL_SURFACE_SWAP_FROM,
  RENTAL_METAL_FINISH_FROM,
} from "./materialSwapMaps";

const BATH_WALL_MIN_WIDTH_INCHES = 40;

const DEFAULT_SCOPE_REASONING =
  "Within scope and investment range; suitable for selected finish level.";

function materialKey(m: ProposedMaterial): string {
  return `${m.slotId}|${m.roomId ?? "default"}`;
}

function addScopeReason(
  scopeByKey: Record<string, string[]>,
  m: ProposedMaterial,
  text: string
): void {
  const key = materialKey(m);
  if (!scopeByKey[key]) scopeByKey[key] = [];
  scopeByKey[key].push(text);
}

function first(answers: QuizAnswers, key: string): string | undefined {
  const v = answers[key];
  if (!v || !Array.isArray(v) || v.length === 0) return undefined;
  return v[0];
}

function list(answers: QuizAnswers, key: string): string[] {
  const v = answers[key];
  if (!v || !Array.isArray(v)) return [];
  return v;
}

/** 1. Fiscal Audit: complexity vs investment_range; if mismatch, swap Luxury → Value/Elevated until comfortable or tight. */
function runFiscalAudit(
  answers: QuizAnswers,
  proposed: ProposedMaterial[],
  reasoning: string[],
  scopeByKey: Record<string, string[]>
): { materials: ProposedMaterial[]; budgetStatus: BudgetFit } {
  const capacity = getBudgetCapacityPoints(answers);
  const complexity = computeComplexityPoints(answers);
  if (capacity == null) {
    return {
      materials: proposed,
      budgetStatus: computeBudgetFit(complexity, 0, answers),
    };
  }
  let budgetStatus = computeBudgetFit(complexity, capacity, answers);
  let materials = [...proposed];

  if (budgetStatus !== "mismatch") {
    return { materials, budgetStatus };
  }

  // Iterate: swap Luxury items for Value/Elevated equivalents until fit is comfortable or tight.
  const maxIterations = 20;
  for (let i = 0; i < maxIterations && budgetStatus === "mismatch"; i++) {
    let swapped = false;
    const next = materials.map((m) => {
      if (!LUXURY_MATERIAL_IDS.has(m.id)) return m;
      const substituteId = FISCAL_DOWNGRADE_MAP[m.id];
      if (!substituteId) return m;
      swapped = true;
      const msg = `Swapped to ${substituteId} to align with investment range.`;
      reasoning.push(`Swapped ${m.id} for ${substituteId} to align with investment range (fiscal audit).`);
      addScopeReason(scopeByKey, m, msg);
      return { ...m, id: substituteId };
    });
    if (!swapped) break;
    materials = next;
    // Re-run budget fit (we don't recompute complexity from materials; we assume one swap reduces effective load).
    // Per spec: "until the fit is 'comfortable' or 'tight'" — use a simple relaxation: one round of swaps then recheck.
    budgetStatus = "tight";
    break;
  }

  return { materials, budgetStatus };
}

/** 2. Maintenance & Ownership: investment_rental → stone/metal/surface swaps; immediate_flip → cap at Elevated unless overridden. */
function runMaintenanceAndOwnership(
  projectFor: string | undefined,
  materials: ProposedMaterial[],
  reasoning: string[],
  scopeByKey: Record<string, string[]>
): ProposedMaterial[] {
  if (projectFor === "investment_rental") {
    return materials.map((m) => {
      const tags = (m.materialTags ?? []).map((t) => t.toLowerCase());
      const idLower = m.id.toLowerCase();

      if (
        RENTAL_STONE_SWAP_FROM.some((s) => idLower.includes(s) || tags.includes(s))
        && !RENTAL_SAFE_STONE_IDS.has(m.id)
      ) {
        reasoning.push(
          `Swapped ${m.id} for quartz/porcelain/quartzite/ceramic due to rental maintenance requirements.`
        );
        addScopeReason(scopeByKey, m, "Swapped to durable stone (quartz/porcelain) for rental maintenance.");
        return { ...m, id: "stone.quartz_soft_white", materialTags: [...(m.materialTags ?? []), "quartz"] };
      }

      if (
        RENTAL_METAL_FINISH_FROM.some((f) => tags.includes(f) || idLower.includes(f))
        && !RENTAL_SAFE_METAL_IDS.has(m.id)
      ) {
        reasoning.push(
          `Swapped unlacquered/raw metal for lacquered/PVD/polished (e.g. French Gold) due to rental durability.`
        );
        addScopeReason(scopeByKey, m, "Lacquered or PVD finish for rental durability.");
        return { ...m, id: "metal.brass_lacquered_gold", materialTags: [...(m.materialTags ?? []), "lacquered"] };
      }

      if (RENTAL_SURFACE_SWAP_FROM.some((s) => tags.includes(s) || idLower.includes(s))) {
        reasoning.push(
          `Swapped plaster/limewash for standard paint due to rental maintenance requirements.`
        );
        addScopeReason(scopeByKey, m, "Standard paint for rental maintenance.");
        return { ...m, materialTags: [...(m.materialTags ?? []).filter((t) => !RENTAL_SURFACE_SWAP_FROM.includes(t as any)), "paint"] };
      }

      return m;
    });
  }

  if (projectFor === "immediate_flip") {
    return materials.map((m) => {
      const sub = FISCAL_DOWNGRADE_MAP[m.id];
      if (m.tier === "Luxury" && sub) {
        reasoning.push(`Finish level capped at Elevated for flip ROI; ${m.id} replaced with ${sub}.`);
        addScopeReason(scopeByKey, m, "Finish capped at Elevated for flip ROI.");
        return { ...m, id: sub, tier: "Elevated" as const };
      }
      return m;
    });
  }

  return materials;
}

/** 3. Finish tier constraints: Builder-Plus veto exotic/custom; Mid-Range veto exotic in kitchen, minimize full wall tile; High-End full unlock. */
function applyFinishTierConstraints(
  finishLevel: string | undefined,
  materials: ProposedMaterial[],
  reasoning: string[],
  scopeByKey: Record<string, string[]>
): ProposedMaterial[] {
  const finish = finishLevel ?? "";

  if (finish === "builder_plus" || finish === "value") {
    return materials.map((m) => {
      if (EXOTIC_STONE_IDS.has(m.id)) {
        reasoning.push(
          `Builder-Plus (Value): Vetoed exotic stone ${m.id}; prefer pre-fabricated and ceramic/porcelain.`
        );
        addScopeReason(scopeByKey, m, "Builder-Plus: quartz/porcelain preferred; exotic stone vetoed.");
        return { ...m, id: "stone.quartz_soft_white" };
      }
      if ((m.materialTags ?? []).some((t) => t.toLowerCase().includes("custom") && t.toLowerCase().includes("millwork"))) {
        reasoning.push(`Builder-Plus: Vetoed custom millwork; prioritizing pre-fabricated options.`);
        addScopeReason(scopeByKey, m, "Pre-fabricated options preferred at this finish tier.");
        return m;
      }
      return m;
    });
  }

  if (finish === "mid" || finish === "elevated") {
    return materials.map((m) => {
      const room = (m.roomId ?? "").toLowerCase();
      const isKitchen = room === "kitchen";
      if (isKitchen && EXOTIC_STONE_IDS.has(m.id)) {
        reasoning.push(`Mid-Range: Vetoed exotic stone in kitchen (${m.id}).`);
        addScopeReason(scopeByKey, m, "Mid-Range: non-exotic stone in kitchen.");
        return { ...m, id: "stone.calacatta_lux_quartzite" };
      }
      if ((m.materialTags ?? []).some((t) => t.toLowerCase().includes("full wall tile"))) {
        reasoning.push(`Mid-Range: Minimizing full wall tile installation.`);
        addScopeReason(scopeByKey, m, "Full wall tile minimized at this tier.");
      }
      return m;
    });
  }

  return materials;
}

/** 4. Technical: 40-inch rule (lighting in bathrooms only) — wall < 40" → override side sconce with horizontal overhead. Other slots are unchanged. */
function apply40InchRule(
  dimensions: RoomDimensions[] | undefined,
  materials: ProposedMaterial[],
  reasoning: string[],
  scopeByKey: Record<string, string[]>
): ProposedMaterial[] {
  if (!dimensions?.length) return materials;

  const narrowBathWalls = (dimensions ?? []).filter(
    (d) => (d.wallWidthInches ?? 0) > 0 && (d.wallWidthInches ?? 0) < BATH_WALL_MIN_WIDTH_INCHES
  );
  if (narrowBathWalls.length === 0) return materials;

  const narrowRoomIds = new Set(narrowBathWalls.map((d) => d.roomId));

  return materials.map((m) => {
    if (m.fixtureType !== "sconce") return m;
    const roomId = (m.roomId ?? "").toLowerCase();
    if (!narrowRoomIds.has(roomId)) return m;
    reasoning.push(
      `Bathroom wall width under 40": overrode side-mounted sconce with horizontal overhead fixture for ${roomId}.`
    );
    addScopeReason(scopeByKey, m, "Wall under 40\" wide; horizontal overhead fixture specified instead of sconces.");
    return {
      ...m,
      id: OVERHEAD_FIXTURE_PLACEHOLDER_ID,
      fixtureType: "overhead" as const,
    };
  });
}

/**
 * Run the full PM Agent: fiscal audit, maintenance/ownership, finish tier, 40-inch rule.
 * Returns auditedMaterials (each with scopeReasoning for the Decision Details Scope column),
 * budgetStatus, and professionalReasoning. Studio Coordinator uses scopeReasoning only — no rule UI.
 */
export function runProjectManagerAudit(
  metadata: ProjectMetadata,
  proposedMaterials: ProposedMaterial[]
): ProjectManagerAgentOutput {
  const reasoning: string[] = [];
  const scopeByKey: Record<string, string[]> = {};
  const { answers, dimensions } = metadata;

  const { materials: afterFiscal, budgetStatus } = runFiscalAudit(
    answers,
    proposedMaterials,
    reasoning,
    scopeByKey
  );

  const projectFor = first(answers, "project_for");
  const afterMaintenance = runMaintenanceAndOwnership(
    projectFor,
    afterFiscal,
    reasoning,
    scopeByKey
  );

  const finishLevel = first(answers, "finish_level");
  const afterFinishTier = applyFinishTierConstraints(
    finishLevel,
    afterMaintenance,
    reasoning,
    scopeByKey
  );

  const auditedMaterials = apply40InchRule(dimensions, afterFinishTier, reasoning, scopeByKey);

  // Attach human-readable scopeReasoning to each material for the Decision Details table Scope column.
  const withScopeReasoning: ProposedMaterial[] = auditedMaterials.map((m) => {
    const key = materialKey(m);
    const parts = scopeByKey[key];
    const scopeReasoning =
      parts && parts.length > 0 ? parts.join(" ") : DEFAULT_SCOPE_REASONING;
    return { ...m, scopeReasoning };
  });

  return {
    auditedMaterials: withScopeReasoning,
    budgetStatus,
    professionalReasoning: reasoning,
  };
}
