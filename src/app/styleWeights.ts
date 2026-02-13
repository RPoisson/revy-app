// src/app/styleWeights.ts

export type Archetype = "parisian" | "provincial" | "mediterranean";

export interface StyleWeights {
  archetype?: Partial<Record<Archetype, number>>;
  modernRustic?: number;   // 0 = modern, 1 = rustic
  minimalLayered?: number; // 0 = minimal, 1 = layered
  brightMoody?: number;    // 0 = bright, 1 = moody
}

/**
 * STYLE_WEIGHTS maps option.id → style weights.
 *
 * It should stay aligned with the options defined in `src/questions.ts`.
 * Only include options that exist in the current quiz.
 *
 * Current quiz (as of your latest):
 * - home_exterior_style  → (constraint only; intentionally NOT scored here)
 * - spaces_appeal        → space_01 ... space_27
 * - space_home           → home_01, home_02, home_03
 * - light_color          → light_01, light_02, light_03
 * - material_palette     → material-01, material-02, material-03
 * - space_feel           → feel-01, feel-02, feel-03
 * - color_mood           → mood-01, mood-02, mood-03, mood-04
 */

export const STYLE_WEIGHTS: Record<string, StyleWeights> = {
  // --- spaces_appeal (space_01 ... space_27) ---
  space_01: { archetype: { provincial: 1 }, modernRustic: 1, minimalLayered: 0.4, brightMoody: 0.4 },
  space_02: { archetype: { parisian: 0.5, provincial: 0.5 }, modernRustic: 0.5, minimalLayered: 0.5, brightMoody: 0.3 },
  space_03: { archetype: { parisian: 0.3, provincial: 1 }, modernRustic: 0.7, minimalLayered: 0.6, brightMoody: 0.4 },
  space_04: { archetype: { parisian: 0.9, provincial: 0.1 }, modernRustic: 0.6, minimalLayered: 0.8, brightMoody: 0.7 },
  space_05: { archetype: { provincial: 1 }, modernRustic: 0.8, minimalLayered: 0.7, brightMoody: 1 },
  space_06: { archetype: { provincial: 1 }, modernRustic: 0.9, minimalLayered: 0.7, brightMoody: 0.3 },
  space_07: { archetype: { parisian: 1 }, modernRustic: 0.4, minimalLayered: 1, brightMoody: 0.7 },
  space_08: { archetype: { provincial: 0.5, mediterranean: 1 }, modernRustic: 0.8, minimalLayered: 0.4, brightMoody: 0.3 },
  space_09: { archetype: { mediterranean: 1 }, modernRustic: 0.3, minimalLayered: 0.2, brightMoody: 0 },

  space_10: { archetype: { parisian: 1 }, modernRustic: 0.1, minimalLayered: 0.8, brightMoody: 1 },
  space_11: { archetype: { mediterranean: 1 }, modernRustic: 0.3, minimalLayered: 0.6, brightMoody: 0.3 },
  space_12: { archetype: { mediterranean: 1 }, modernRustic: 0.3, minimalLayered: 0.4, brightMoody: 0.5 },
  space_13: { archetype: { parisian: 1 }, modernRustic: 0.1, minimalLayered: 0.2, brightMoody: 0.2 },
  space_14: { archetype: { parisian: 1 }, modernRustic: 0.1, minimalLayered: 1, brightMoody: 0.7 },
  space_15: { archetype: { mediterranean: 1 }, modernRustic: 0.6, minimalLayered: 0.5, brightMoody: 0.3 },
  space_16: { archetype: { mediterranean: 1 }, modernRustic: 0.7, minimalLayered: 0.2, brightMoody: 0.2 },
  space_17: { archetype: { mediterranean: 1, parisian: 0.4 }, modernRustic: 0.3, minimalLayered: 0.8, brightMoody: 0.3 },
  space_18: { archetype: { parisian: 1 }, modernRustic: 0.4, minimalLayered: 0.5, brightMoody: 0.5 },

  space_19: { archetype: { parisian: 1 }, modernRustic: 0.5, minimalLayered: 0.6, brightMoody: 0.4 },
  space_20: { archetype: { parisian: 1 }, modernRustic: 0.4, minimalLayered: 1, brightMoody: 1 },
  space_21: { archetype: { parisian: 1 }, modernRustic: 0.3, minimalLayered: 0.7, brightMoody: 0.5 },
  space_22: { archetype: { mediterranean: 0.9, provincial: 0.4 }, modernRustic: 0.7, minimalLayered: 0.6, brightMoody: 0.3 },
  space_23: { archetype: { parisian: 1 }, modernRustic: 0.2, minimalLayered: 0.2, brightMoody: 0.1 },
  space_24: { archetype: { mediterranean: 1 }, modernRustic: 0.3, minimalLayered: 0.2, brightMoody: 0.2 },
  space_25: { archetype: { parisian: 1 }, modernRustic: 0.2, minimalLayered: 0.3, brightMoody: 0.3 },
  space_26: { archetype: { mediterranean: 0.3, parisian: 1 }, modernRustic: 0.5, minimalLayered: 0.9, brightMoody: 0.7 },
  space_27: { archetype: { parisian: 1 }, modernRustic: 0.3, minimalLayered: 0.5, brightMoody: 0.5 },

  // --- space_home (home_01 ... home_03) ---
  home_01: { archetype: { parisian: 1 } },
  home_02: { archetype: { provincial: 1 } },
  home_03: { archetype: { mediterranean: 1 } },

  // --- light_color (light_01 ... light_03) ---
  light_01: { brightMoody: 0.1 },
  light_02: { brightMoody: 0.5 },
  light_03: { brightMoody: 1 },

  // --- material_palette (material-01 ... material-03) ---
  "material-01": { modernRustic: 0.1 },
  "material-02": { modernRustic: 0.5 },
  "material-03": { modernRustic: 0.9 },

  // --- space_feel (feel-01 ... feel-03) ---
  "feel-01": { minimalLayered: 0.1 },
  "feel-02": { minimalLayered: 0.5 },
  "feel-03": { minimalLayered: 0.9 },

  // --- color_mood (mood-01 ... mood-04) ---
  "mood-01": { brightMoody: 0.1 },
  "mood-02": { brightMoody: 0.5 },
  "mood-03": { brightMoody: 0.7 },
  "mood-04": { brightMoody: 1 },
};
