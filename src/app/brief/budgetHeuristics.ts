// src/app/brief/budgetHeuristics.ts
import type { QuizAnswers } from "@/app/quiz/lib/answersStore";

export type BudgetFit = "comfortable" | "tight" | "mismatch";

type ScopeLevel = "light_refresh" | "partial" | "full";
type FinishLevel = "value" | "mid" | "elevated" | "luxury";

/**
 * V1 heuristic: map selected rooms to "cost points"
 * (relative weights; not dollars)
 *
 * Uses your actual `rooms` option ids.
 */
export const ROOM_POINTS: Record<string, number> = {
  // High cost drivers
  kitchen: 10,
  primary_bath: 6,
  guest_bath: 6,
  powder: 3,
  laundry: 2,

  // Lower cost / more cosmetic (finish-focused)
  living: 1,
  family: 1,
  dining: 1,
  bedrooms: 2, // bundle (could represent multiple rooms)
  nursery: 1,
  office: 1,
  entry: 1,
  outdoor: 1,

  /**
   * Special case:
   * Whole home implies broader scope and many rooms/trades.
   * Give it a strong base weight, then let scope/finish multipliers scale it.
   * (Directional for V1; tune later.)
   */
  whole_home: 18,
};

export function getScopeMultiplier(scopeLevel?: string): number {
  const s = (scopeLevel ?? "") as ScopeLevel;
  if (s === "light_refresh") return 0.6;
  if (s === "full") return 1.6;
  // default partial / unknown
  return 1.0;
}

export function getFinishMultiplier(finishLevel?: string): number {
  const f = (finishLevel ?? "") as FinishLevel;
  if (f === "value") return 0.85;
  if (f === "elevated") return 1.25;
  if (f === "luxury") return 1.5;
  // default mid / unknown
  return 1.0;
}

/**
 * Map your investment_range option id to a capacity band in "points".
 * NOTE: These are directional V1 defaults, not dollars.
 *
 * Uses your actual `investment_range` option ids.
 */
export const INVESTMENT_CAPACITY_POINTS: Record<string, number> = {
  under_50: 12,
  "50_100": 18,
  "100_200": 26,
  "200_350": 36,
  "350_500": 48,
  "500_plus": 62,
  // not_sure handled separately (null)
};

/** Reads first answer value */
function first(answers: QuizAnswers, key: string): string | undefined {
  const v = answers[key];
  if (!v || v.length === 0) return undefined;
  return v[0];
}

function list(answers: QuizAnswers, key: string): string[] {
  return answers[key] ?? [];
}

/**
 * Complexity points are computed from:
 *  - room points (selected rooms)
 *  - scope multiplier (light/partial/full)
 *  - finish multiplier (value/mid/elevated/luxury) if present
 *
 * If `whole_home` is selected, we still allow other room selections,
 * but we avoid double-counting by using whole_home as a base and
 * adding only a small increment for other rooms (optional).
 */
export function computeComplexityPoints(answers: QuizAnswers): number {
  const rooms = list(answers, "rooms");
  const scopeLevel = first(answers, "scope_level");
  const finishLevel = first(answers, "finish_level");

  const hasWholeHome = rooms.includes("whole_home");

  let base = 0;

  if (hasWholeHome) {
    // Whole-home base
    base += ROOM_POINTS.whole_home ?? 0;

    // Small incremental signal if they also checked specific rooms.
    // This prevents massive double-counting while still reflecting emphasis.
    for (const roomId of rooms) {
      if (roomId === "whole_home") continue;
      base += Math.min(1, ROOM_POINTS[roomId] ?? 0); // cap per-room add at 1
    }
  } else {
    // Normal sum
    for (const roomId of rooms) {
      base += ROOM_POINTS[roomId] ?? 0;
    }
  }

  const scopeMult = getScopeMultiplier(scopeLevel);
  const finishMult = getFinishMultiplier(finishLevel);

  return Math.round(base * scopeMult * finishMult);
}

/**
 * Returns null when the user selects "Not sure yet" or if mapping is missing.
 */
export function getBudgetCapacityPoints(answers: QuizAnswers): number | null {
  const inv = first(answers, "investment_range");
  if (!inv) return null;
  if (inv === "not_sure") return null;
  return INVESTMENT_CAPACITY_POINTS[inv] ?? null;
}

export function computeBudgetFit(
  complexityPoints: number,
  capacityPoints: number
): BudgetFit {
  // Thresholds tuned for directional V1 guidance
  if (complexityPoints > capacityPoints * 1.15) return "mismatch";
  if (complexityPoints >= capacityPoints * 0.9) return "tight";
  return "comfortable";
}
