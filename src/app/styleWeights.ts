// src/app/styleWeights.ts

export type Archetype = "parisian" | "provincial" | "mediterranean";

export interface StyleWeights {
  archetype: Partial<Record<Archetype, number>>;
  modernRustic?: number;   // 0 = modern, 1 = rustic
  minimalLayered?: number; // 0 = minimal, 1 = layered
  brightMoody?: number;    // 0 = bright, 1 = moody
}

/**
 * STYLE_WEIGHTS maps option.id → style weights.
 *
 * It is intentionally aligned with src/app/questions.ts:
 *
 * ❌ Usage questions (Q1–Q3) are NOT included here:
 *    - bathroom_primary_user (guest, primary, children, teens, powder)
 *    - bathroom_vanity_type  (single, double)
 *    - bathroom_bathing_type (shower, tub, both)
 *    These should not affect style.
 *
 * ✅ Aesthetic questions (Q4–Q11) ARE included:
 *    Q4: spaces_appeal     → space_01 ... space_27
 *    Q5: space_home        → home_01, home_02, home_03
 *    Q6: light_color       → light_01, light_02, light_03
 *    Q7: vacation_setting  → vacation_01, vacation_02, vacation_03
 *    Q8: material_palette  → material_01, material_02, material_03
 *    Q9: space_feel        → feel_01, feel_02, feel_03
 *    Q10: textures         → texture_01, texture_02, texture_03
 *    Q11: color_mood       → mood_01, mood_02, mood_03, mood_04
 *
 * The numeric values are a first tuning pass; you can adjust over time.
 */

export const STYLE_WEIGHTS: Record<string, StyleWeights> = {
  // --- Q4: spaces_appeal (space_01 ... space_27) ---
  // Rough grouping: 1–9 Parisian, 10–18 Provincial, 19–27 Mediterranean.

  space_01: {
    archetype: { provincial: 1 },
    modernRustic: 1,
    minimalLayered: 0.4,
    brightMoody: 0.4,
  },
  space_02: {
    archetype: { parisian: 0.5, provincial: 0.5 },
    modernRustic: 0.5,
    minimalLayered: 0.5,
    brightMoody: 0.3,
  },
  space_03: {
    archetype: { parisian: 0.3, provincial: 1 },
    modernRustic: 0.7,
    minimalLayered: 0.6,
    brightMoody: 0.4,
  },
  space_04: {
    archetype: { parisian: 0.9, provincial: 0.1 },
    modernRustic: 0.6,
    minimalLayered: 0.8,
    brightMoody: 0.7,
  },
  space_05: {
    archetype: { provincial: 1 },
    modernRustic: 0.8,
    minimalLayered: 0.7,
    brightMoody: 1,
  },
  space_06: {
    archetype: { provincial: 1 },
    modernRustic: 0.9,
    minimalLayered: 0.7,
    brightMoody: 0.3,
  },
  space_07: {
    archetype: { parisian: 1 },
    modernRustic: 0.4,
    minimalLayered: 1,
    brightMoody: 0.7,
  },
  space_08: {
    archetype: { provincial: 0.5, mediterranean: 1 },
    modernRustic: 0.8,
    minimalLayered: 0.4,
    brightMoody: 0.3,
  },
  space_09: {
    archetype: { mediterranean: 1 },
    modernRustic: 0.3,
    minimalLayered: 0.2,
    brightMoody: 0,
  },

  space_10: {
    archetype: { parisian: 1 },
    modernRustic: 0.1,
    minimalLayered: 0.8,
    brightMoody: 1,
  },
  space_11: {
    archetype: { mediterranean: 1 },
    modernRustic: 0.3,
    minimalLayered: 0.6,
    brightMoody: 0.3,
  },
  space_12: {
    archetype: { mediterranean: 1 },
    modernRustic: 0.3,
    minimalLayered: 0.4,
    brightMoody: 0.5,
  },
  space_13: {
    archetype: { parisian: 1 },
    modernRustic: 0.1,
    minimalLayered: 0.2,
    brightMoody: 0.2,
  },
  space_14: {
    archetype: { parisian: 1 },
    modernRustic: 0.1,
    minimalLayered: 1,
    brightMoody: 0.7,
  },
  space_15: {
    archetype: { mediterranean: 1 },
    modernRustic: 0.6,
    minimalLayered: 0.5,
    brightMoody: 0.3,
  },
  space_16: {
    archetype: { mediterranean: 1 },
    modernRustic: 0.7,
    minimalLayered: 0.2,
    brightMoody: 0.2,
  },
  space_17: {
    archetype: { mediterranean: 1, parisian: 0.4 },
    modernRustic: 0.3,
    minimalLayered: 0.8,
    brightMoody: 0.3,
  },
  space_18: {
    archetype: { parisian: 1 },
    modernRustic: 0.4,
    minimalLayered: 0.5,
    brightMoody: 0.5,
  },

  space_19: {
    archetype: { parisian: 1 },
    modernRustic: 0.5,
    minimalLayered: 0.6,
    brightMoody: 0.4,
  },
  space_20: {
    archetype: { parisian: 1 },
    modernRustic: 0.4,
    minimalLayered: 1,
    brightMoody: 1,
  },
  space_21: {
    archetype: { parisian: 1 },
    modernRustic: 0.3,
    minimalLayered: 0.7,
    brightMoody: 0.5,
  },
  space_22: {
    archetype: { mediterranean: 0.9, provincial: 0.4 },
    modernRustic: 0.7,
    minimalLayered: 0.6,
    brightMoody: 0.3,
  },
  space_23: {
    archetype: { parisian: 1 },
    modernRustic: 0.2,
    minimalLayered: 0.2,
    brightMoody: 0.1,
  },
  space_24: {
    archetype: { mediterranean: 1 },
    modernRustic: 0.3,
    minimalLayered: 0.2,
    brightMoody: 0.2,
  },
  space_25: {
    archetype: { parisian: 1 },
    modernRustic: 0.2,
    minimalLayered: 0.3,
    brightMoody: 0.3,
  },
  space_26: {
    archetype: { mediterranean: 0.3, parisian: 1 },
    modernRustic: 0.5,
    minimalLayered: 0.9,
    brightMoody: 0.7,
  },
  space_27: {
    archetype: { parisian: 1 },
    modernRustic: 0.3,
    minimalLayered: 0.5,
    brightMoody: 0.5,
  },

  // --- Q5: space_home (home_01 ... home_03) ---
  home_01: {
    archetype: { parisian: 1 },
  },
  home_02: {
    archetype: { provincial: 1 },
  },
  home_03: {
    archetype: { mediterranean: 1 },
  },

  // --- Q6: light_color (light_01 ... light_03) ---
  light_01: {
    archetype: {},
    brightMoody: 0.1,
  },
  light_02: {
    archetype: {},
    brightMoody: 0.5,
  },
  light_03: {
    archetype: {},
    brightMoody: 1,
  },

  // --- Q7: vacation_setting (vacation_01 ... vacation_03) ---
  vacation_01: {
    archetype: { parisian: 1 },
  },
  vacation_02: {
    archetype: { provincial: 1 },
  },
  vacation_03: {
    archetype: { mediterranean: 1 },
  },

  // --- Q8: material_palette (material_01 ... material_03) ---
  material_01: {
    archetype: { parisian: 1 },
    modernRustic: 0.1,
  },
  material_02: {
    archetype: { mediterranean: 0.7, provincial: 0.5 },
    modernRustic: 0.5,
  },
  material_03: {
    archetype: { provincial: 1 },
    modernRustic: 0.9,
  },

  // --- Q9: space_feel (feel_01 ... feel_03) ---
  feel_01: {
    archetype: {},
    minimalLayered: 0.1,
  },
  feel_02: {
    archetype: {},
    minimalLayered: 0.5,
  },
  feel_03: {
    archetype: {},
    minimalLayered: 0.9,
  },

  // --- Q10: textures (texture_01 ... texture_03) ---
  texture_01: {
    archetype: { parisian: 1 },
    modernRustic: 0.1,
  },
  texture_02: {
    archetype: { provincial: 0.5, mediterranean: 0.5 },
    modernRustic: 0.5,
  },
  texture_03: {
    archetype: { mediterranean: 0.5, provincial: 0.5 },
    modernRustic: 0.9,
  },

  // --- Q11: color_mood (mood_01 ... mood_04) ---
  mood_01: {
    archetype: {},
    brightMoody: 0.1,
  },
  mood_02: {
    archetype: {},
    brightMoody: 0.5,
  },
  mood_03: {
    archetype: {},
    brightMoody: 0.7,
  },
  mood_04: {
    archetype: {},
    brightMoody: 1,
  },
};
