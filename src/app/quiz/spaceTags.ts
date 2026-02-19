//revy-quiz/src/app/spaceTags.ts

export type ArchetypeId = "parisian" | "provincial" | "mediterranean";

export type SpaceTag = {
  archetype: Partial<Record<ArchetypeId, number>>;
  modernRustic: number;
  minimalLayered: number;
  brightMoody: number;
};

export const SPACE_TAGS: Record<string, SpaceTag> = {
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
};
