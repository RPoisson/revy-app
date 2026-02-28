// src/app/brief/budgetHeuristics.ts
// 2026 Rêvy Decision Engine — Budget Fit logic aligned to cost assumptions by Remodel Scope and Finish Level

import type { QuizAnswers } from "@/app/quiz/lib/answersStore";

export type BudgetFit = "comfortable" | "tight" | "mismatch";
export type BudgetFlexibility = "tight" | "some_buffer" | "flexible" | "not_sure";

/** Reads first answer value */
function first(answers: QuizAnswers, key: string): string | undefined {
  const v = answers[key];
  if (!v || v.length === 0) return undefined;
  return v[0];
}

function list(answers: QuizAnswers, key: string): string[] {
  const v = answers[key];
  if (!v || !Array.isArray(v)) return [];
  return v;
}

// ─────────────────────────────────────────────────────────────
// 2026 Complexity Points (room intensity)
// Calibrated to: Primary Wet Rooms > Secondary Wet/Utility > Living/Dry
// ─────────────────────────────────────────────────────────────

export const ROOM_POINTS: Record<string, number> = {
  kitchen: 10,
  primary_bath: 6,
  guest_bath: 5,
  secondary_bath: 5,
  kids_bath: 5,
  powder: 3,
  laundry: 2,
  living: 1,
  family: 1,
  dining: 1,
  bedrooms: 1.5,
  primary_bedroom: 1.5,
  nursery_bedroom: 1,
  child_bedroom: 1,
  teen_bedroom: 1,
  office: 1,
  entry: 1,
  outdoor: 1,
};

// ─────────────────────────────────────────────────────────────
// Scope multiplier (structural intensity)
// refresh = Finishes Only | partial = Minor Build/Structural | full = Full Gut | new_build = New Build
// ─────────────────────────────────────────────────────────────

export function getScopeMultiplier(scopeLevel?: string): number {
  const s = scopeLevel ?? "";
  if (s === "refresh" || s === "light_refresh") return 0.6;
  if (s === "partial") return 1.0;
  if (s === "full") return 1.6;
  if (s === "new_build") return 2.0;
  return 1.0;
}

// ─────────────────────────────────────────────────────────────
// Finish multiplier (material tier)
// builder_plus = Value | mid = Mid-Range (Elevated) | high = High-End (Luxury)
// ─────────────────────────────────────────────────────────────

export function getFinishMultiplier(finishLevel?: string): number {
  const f = finishLevel ?? "";
  if (f === "builder_plus" || f === "value") return 0.85;
  if (f === "mid" || f === "elevated") return 1.0;
  if (f === "high" || f === "luxury") return 1.5;
  return 1.0;
}

// ─────────────────────────────────────────────────────────────
// 2026 Investment capacity (points) by range
// Calibrated to market tiers: under_50 … 500_plus
// ─────────────────────────────────────────────────────────────

export const INVESTMENT_CAPACITY_POINTS: Record<string, number> = {
  under_50: 12,
  "50_100": 20,
  "100_200": 30,
  "200_350": 42,
  "350_500": 54,
  "500_plus": 70,
};

// ─────────────────────────────────────────────────────────────
// Range flexibility: grace factor for budget fit
// Tight = no tolerance; Some buffer = 10%; Flexible = 25%
// ─────────────────────────────────────────────────────────────

export function getFlexibilityGrace(flex?: string): number {
  switch (flex as BudgetFlexibility) {
    case "tight":
      return 1.0;
    case "some_buffer":
      return 1.1;
    case "flexible":
      return 1.25;
    case "not_sure":
    default:
      return 1.15;
  }
}

// ─────────────────────────────────────────────────────────────
// Complexity points: rooms × scope × finish
// ─────────────────────────────────────────────────────────────

export function computeComplexityPoints(answers: QuizAnswers): number {
  const rooms = list(answers, "rooms");
  const scopeLevel = first(answers, "scope_level");
  const finishLevel = first(answers, "finish_level");

  const scopeMult = getScopeMultiplier(scopeLevel);
  const finishMult = getFinishMultiplier(finishLevel);

  let base = 0;
  for (const roomId of rooms) {
    base += ROOM_POINTS[roomId] ?? 0;
  }

  return Math.round(base * scopeMult * finishMult);
}

/**
 * Returns capacity points for the selected investment range, or null if missing.
 */
export function getBudgetCapacityPoints(answers: QuizAnswers): number | null {
  const inv = first(answers, "investment_range");
  if (!inv) return null;
  if (inv === "not_sure") return null;
  return INVESTMENT_CAPACITY_POINTS[inv] ?? null;
}

/**
 * Budget fit: complexity vs capacity, with flexibility grace.
 * Uses range_flexibility (tight / some_buffer / flexible / not_sure) to allow more headroom when flexible.
 */
export function computeBudgetFit(
  complexityPoints: number,
  capacityPoints: number,
  answers: QuizAnswers
): BudgetFit {
  const flexibility = first(answers, "range_flexibility");
  const grace = getFlexibilityGrace(flexibility);

  const effectiveCapacity = capacityPoints * grace;
  if (complexityPoints > effectiveCapacity) return "mismatch";
  if (complexityPoints >= effectiveCapacity * 0.9) return "tight";
  return "comfortable";
}
