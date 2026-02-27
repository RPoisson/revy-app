// src/app/agents/projectManagerSelection.ts
// PM ↔ Creative Director loop: receive multiple candidates per slot, return exactly one per slot.
// Priority: finish and scope rules first, then budget. Respects pairing rules so selections across slots are compatible.
// Selection order: slots with no pairing dependency first, then dependent slots (slotKeyB after slotKeyA).

import type { QuizAnswers } from "@/app/quiz/lib/answersStore";
import {
  computeBudgetFit,
  computeComplexityPoints,
  getBudgetCapacityPoints,
  type BudgetFit,
} from "@/app/brief/budgetHeuristics";
import type {
  CreativeDirectorOutput,
  PairingRule,
  ProductCandidate,
  ProjectMetadata,
  ProjectManagerSelectionOutput,
  SelectedProduct,
} from "./projectManagerAgent.types";

const BATH_WALL_MIN_WIDTH_INCHES = 40;
const DEFAULT_SCOPE_REASONING =
  "Within scope and investment range; suitable for selected finish level.";

// Material/finish strings from DB (lowercase) that trigger PM rules
const RENTAL_STONE_EXCLUDE = ["marble", "limestone", "terracotta"];
const RENTAL_STONE_PREFER = ["quartz", "porcelain", "quartzite", "ceramic"];
const RENTAL_METAL_EXCLUDE = ["unlacquered", "raw"];
const RENTAL_METAL_PREFER = ["lacquered", "pvd", "polished"];
const RENTAL_SURFACE_EXCLUDE = ["plaster", "limewash"];
const EXOTIC_MATERIALS = ["marble", "calacatta", "perla", "taj mahal", "carrara"];

function first(answers: QuizAnswers, key: string): string | undefined {
  const v = answers[key];
  if (!v || !Array.isArray(v) || v.length === 0) return undefined;
  return v[0];
}

function slotKey(slotId: string, roomId?: string): string {
  return roomId ? `${slotId}|${roomId}` : slotId;
}

/** Returns true if candidate passes finish/scope rules (rental, flip, finish tier, 40-inch). */
function passesFinishAndScopeRules(
  c: ProductCandidate,
  projectFor: string | undefined,
  finishLevel: string | undefined,
  narrowBathRoomIds: Set<string>,
  reasoning: string[]
): { pass: boolean; reason?: string } {
  const mat = (c.material ?? "").toLowerCase();
  const fin = (c.finish ?? "").toLowerCase();
  const room = (c.roomId ?? "").toLowerCase();

  // 40-inch rule applies only to lighting in bathrooms; other slots are not considered.
  const isLightingSlot = c.slotId.toLowerCase().includes("light");
  if (isLightingSlot && c.fixtureType === "sconce" && narrowBathRoomIds.has(room)) {
    return { pass: false, reason: "Wall under 40\" wide; sconce excluded; prefer overhead." };
  }

  if (projectFor === "investment_rental") {
    if (RENTAL_STONE_EXCLUDE.some((s) => mat.includes(s))) {
      return { pass: false, reason: "Rental: durable stone (quartz/porcelain) preferred." };
    }
    if (RENTAL_METAL_EXCLUDE.some((f) => fin.includes(f))) {
      return { pass: false, reason: "Rental: lacquered or PVD finish preferred." };
    }
    if (RENTAL_SURFACE_EXCLUDE.some((s) => mat.includes(s))) {
      return { pass: false, reason: "Rental: standard paint preferred over plaster/limewash." };
    }
  }

  if (projectFor === "immediate_flip") {
    if (c.tier === "Luxury") {
      return { pass: false, reason: "Flip: finish capped at Elevated for ROI." };
    }
  }

  const finish = finishLevel ?? "";
  if (finish === "builder_plus" || finish === "value") {
    if (EXOTIC_MATERIALS.some((e) => mat.includes(e))) {
      return { pass: false, reason: "Builder-Plus: quartz/porcelain preferred; exotic stone vetoed." };
    }
  }

  if (finish === "mid" || finish === "elevated") {
    const isKitchen = room === "kitchen";
    if (isKitchen && EXOTIC_MATERIALS.some((e) => mat.includes(e))) {
      return { pass: false, reason: "Mid-Range: non-exotic stone preferred in kitchen." };
    }
  }

  return { pass: true };
}

/** Rank candidates: prefer lower price when budget is tight/mismatch; else first. */
function rankByBudget(
  candidates: ProductCandidate[],
  budgetStatus: BudgetFit
): ProductCandidate[] {
  if (candidates.length <= 1) return candidates;
  if (budgetStatus === "tight" || budgetStatus === "mismatch") {
    return [...candidates].sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));
  }
  return candidates;
}

/** True if candidate is compatible with the already-selected product for the paired slot. */
function isCompatibleWith(
  candidate: ProductCandidate,
  selectedProduct: ProductCandidate,
  matchBy: PairingRule["matchBy"]
): boolean {
  const a = selectedProduct;
  const b = candidate;
  switch (matchBy) {
    case "compatibility_key":
      if (a.compatibility_key == null || b.compatibility_key == null) return true;
      return String(a.compatibility_key).trim() === String(b.compatibility_key).trim();
    case "metal_match_key":
      if (a.metal_match_key == null || b.metal_match_key == null) return true;
      return String(a.metal_match_key).trim() === String(b.metal_match_key).trim();
    case "pairing_option": {
      const aOpt = Array.isArray(a.pairing_option) ? a.pairing_option : (a.pairing_option ? [a.pairing_option] : []);
      const bOpt = Array.isArray(b.pairing_option) ? b.pairing_option : (b.pairing_option ? [b.pairing_option] : []);
      const aId = a.id?.toLowerCase() ?? "";
      const bId = b.id?.toLowerCase() ?? "";
      const aTitle = (a.title ?? "").toLowerCase();
      const bTitle = (b.title ?? "").toLowerCase();
      const bPairsWithA = bOpt.some((p) => String(p).toLowerCase().includes(aId) || String(p).toLowerCase().includes(aTitle));
      const aPairsWithB = aOpt.some((p) => String(p).toLowerCase().includes(bId) || String(p).toLowerCase().includes(bTitle));
      return bPairsWithA || aPairsWithB || (aOpt.length === 0 && bOpt.length === 0);
    }
    default:
      return true;
  }
}

/**
 * Build selection order from pairing rules: slotKeyA before slotKeyB for each rule.
 * Slots with no dependency are first; then dependent slots in dependency order.
 */
function buildSelectionOrder(
  slotKeys: string[],
  pairingRules: PairingRule[]
): string[] {
  if (!pairingRules?.length) return slotKeys;
  const before = new Map<string, Set<string>>();
  for (const k of slotKeys) before.set(k, new Set());
  for (const r of pairingRules) {
    if (slotKeys.includes(r.slotKeyA) && slotKeys.includes(r.slotKeyB)) {
      before.get(r.slotKeyB)!.add(r.slotKeyA);
    }
  }
  const visited = new Set<string>();
  const result: string[] = [];
  function visit(key: string) {
    if (visited.has(key)) return;
    visited.add(key);
    for (const dep of before.get(key) ?? []) visit(dep);
    result.push(key);
  }
  for (const k of slotKeys) visit(k);
  return result;
}

/**
 * PM selection: multiple candidates per slot in, exactly one per slot out.
 * Priority: finish/scope rules first (filter), then budget (rank and pick).
 * Never returns null for a slot: if no candidate passes rules, picks best by budget and adds relaxed reasoning.
 */
export function runProjectManagerSelection(
  metadata: ProjectMetadata,
  creativeDirectorOutput: CreativeDirectorOutput
): ProjectManagerSelectionOutput {
  const reasoning: string[] = [];
  const { answers, dimensions } = metadata;
  const projectFor = first(answers, "project_for");
  const finishLevel = first(answers, "finish_level");

  const capacity = getBudgetCapacityPoints(answers);
  const complexity = computeComplexityPoints(answers);
  const budgetStatus: BudgetFit =
    capacity != null ? computeBudgetFit(complexity, capacity, answers) : "comfortable";

  const narrowBathRoomIds = new Set<string>();
  if (dimensions?.length) {
    for (const d of dimensions) {
      const w = d.wallWidthInches ?? 0;
      if (w > 0 && w < BATH_WALL_MIN_WIDTH_INCHES) narrowBathRoomIds.add((d.roomId ?? "").toLowerCase());
    }
  }

  // Normalize input: build slotKey -> candidates; keep slot order when slots[] is provided
  const bySlot: Record<string, ProductCandidate[]> = {};
  const slotOrder: string[] = [];
  if (creativeDirectorOutput.slots) {
    for (const { slotId, roomId, candidates } of creativeDirectorOutput.slots) {
      const key = slotKey(slotId, roomId);
      if (!bySlot[key]) bySlot[key] = [];
      bySlot[key].push(...candidates);
      slotOrder.push(key);
    }
  }
  for (const [key, arr] of Object.entries(creativeDirectorOutput.candidatesBySlot ?? {})) {
    if (!bySlot[key]) {
      bySlot[key] = [];
      slotOrder.push(key);
    }
    bySlot[key].push(...arr);
  }
  const allSlotKeys = slotOrder.length > 0 ? slotOrder : Object.keys(bySlot);
  const pairingRules = creativeDirectorOutput.pairingRules ?? [];
  const keysToProcess = buildSelectionOrder(allSlotKeys, pairingRules);

  const selectionsBySlot: Record<string, SelectedProduct> = {};
  const selections: SelectedProduct[] = [];

  for (const key of keysToProcess) {
    const candidates = bySlot[key];
    if (!candidates) continue;
    if (candidates.length === 0) {
      reasoning.push(`Slot ${key}: no candidates from Creative Director; cannot select. Creative Director must supply at least one candidate per slot.`);
      continue;
    }

    const [slotId, roomId] = key.includes("|") ? key.split("|") : [key, undefined];
    let withRoom = candidates.map((c) => ({ ...c, roomId: c.roomId ?? roomId }));

    // Pairing: if this slot is slotKeyB, keep only candidates compatible with selected slotKeyA
    const rulesWhereThisIsB = pairingRules.filter((r) => r.slotKeyB === key);
    for (const rule of rulesWhereThisIsB) {
      const selectedA = selectionsBySlot[rule.slotKeyA]?.product;
      if (selectedA) {
        const before = withRoom.length;
        withRoom = withRoom.filter((c) => isCompatibleWith(c, selectedA, rule.matchBy));
        if (withRoom.length < before) {
          reasoning.push(`Pairing: filtered ${key} to candidates compatible with ${rule.slotKeyA} (${rule.matchBy}).`);
        }
      }
    }
    if (withRoom.length === 0) {
      reasoning.push(`Slot ${key}: no candidates compatible with pairing rules; using full candidate list.`);
      withRoom = candidates.map((c) => ({ ...c, roomId: c.roomId ?? roomId }));
    }

    const passed = withRoom.filter((c) => {
      const r = passesFinishAndScopeRules(
        c,
        projectFor,
        finishLevel,
        narrowBathRoomIds,
        reasoning
      );
      return r.pass;
    });

    const pool = passed.length > 0 ? passed : withRoom;
    const ranked = rankByBudget(pool, budgetStatus);
    const chosen = ranked[0];
    const pairingApplied = rulesWhereThisIsB.length > 0 && selectionsBySlot[rulesWhereThisIsB[0].slotKeyA];
    const scopeReason =
      passed.length === 0
        ? "Constraints relaxed; selected best available for scope and budget."
        : passed.length < withRoom.length
          ? "Selected for finish/scope fit and budget."
          : pairingApplied
            ? "Selected for scope, budget, and pairing with other slots."
            : DEFAULT_SCOPE_REASONING;

    const selected: SelectedProduct = {
      product: chosen,
      scopeReasoning: scopeReason,
    };
    selectionsBySlot[key] = selected;
    selections.push(selected);
  }

  return {
    selectionsBySlot,
    selections,
    budgetStatus,
    professionalReasoning: reasoning,
  };
}
