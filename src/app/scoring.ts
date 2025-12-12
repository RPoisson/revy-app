// src/app/scoring.ts
import { STYLE_WEIGHTS, Archetype, StyleWeights } from "./styleWeights";

export interface StyleResult {
  archetypeScores: Record<Archetype, number>;
  primaryArchetype: Archetype;
  secondaryArchetype?: Archetype;
  modernRustic: number;   // 0–1 (0 = modern, 1 = rustic)
  minimalLayered: number; // 0–1 (0 = minimal, 1 = layered)
  brightMoody: number;    // 0–1 (0 = bright, 1 = moody)
}

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

// Utility to normalize axis 0–1 with a neutral default
function normalizeAxis(sum: number, count: number): number {
  if (count === 0) return 0.5; // neutral if no data
  const value = sum / count;
  return Math.min(1, Math.max(0, value));
}

const ARCHETYPES: Archetype[] = ["parisian", "provincial", "mediterranean"];

export function scoreQuiz(answers: Answers): StyleResult {
  // Initialize archetype sums
  const archetypeSums: Record<Archetype, number> = {
    parisian: 0,
    provincial: 0,
    mediterranean: 0,
  };

  let modernRusticSum = 0;
  let modernRusticCount = 0;

  let minimalLayeredSum = 0;
  let minimalLayeredCount = 0;

  let brightMoodySum = 0;
  let brightMoodyCount = 0;

  const addWeights = (weights: StyleWeights) => {
    // Archetype scores
    if (weights.archetype) {
      for (const archetype of ARCHETYPES) {
        const value = weights.archetype[archetype];
        if (typeof value === "number") {
          archetypeSums[archetype] += value;
        }
      }
    }

    // Axes
    if (typeof weights.modernRustic === "number") {
      modernRusticSum += weights.modernRustic;
      modernRusticCount += 1;
    }
    if (typeof weights.minimalLayered === "number") {
      minimalLayeredSum += weights.minimalLayered;
      minimalLayeredCount += 1;
    }
    if (typeof weights.brightMoody === "number") {
      brightMoodySum += weights.brightMoody;
      brightMoodyCount += 1;
    }
  };

  // Walk all answers
  Object.values(answers).forEach((answerValue) => {
    const optionIds = Array.isArray(answerValue) ? answerValue : [answerValue];

    optionIds.forEach((optId) => {
      const weights = STYLE_WEIGHTS[optId];
      if (weights) {
        addWeights(weights);
      }
      // If no entry in STYLE_WEIGHTS, we ignore it (e.g., usage-only answers).
    });
  });

  // Determine primary & secondary archetypes
  const entries = (Object.entries(archetypeSums) as [Archetype, number][])
    .sort((a, b) => b[1] - a[1]);

  let primaryArchetype: Archetype = "parisian";
  let secondaryArchetype: Archetype | undefined;

  if (entries.length > 0) {
    const [primary, primaryScore] = entries[0];
    primaryArchetype = primary;

    const [maybeSecondary, secondaryScore] = entries[1] || [primary, 0];
    const ratio = primaryScore > 0 ? secondaryScore / primaryScore : 0;

    if (ratio >= 0.6 && secondaryScore > 0) {
      secondaryArchetype = maybeSecondary;
    }
  }

  return {
    archetypeScores: archetypeSums,
    primaryArchetype,
    secondaryArchetype,
    modernRustic: normalizeAxis(modernRusticSum, modernRusticCount),
    minimalLayered: normalizeAxis(minimalLayeredSum, minimalLayeredCount),
    brightMoody: normalizeAxis(brightMoodySum, brightMoodyCount),
  };
}
