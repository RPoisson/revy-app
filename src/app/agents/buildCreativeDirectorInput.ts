// src/app/agents/buildCreativeDirectorInput.ts
// Builds CreativeDirectorInput from quiz answers for the CD → PM pipeline.

import { scoreQuiz } from "@/app/scoring";
import type { QuizAnswers } from "@/app/quiz/lib/answersStore";
import type { CreativeDirectorInput } from "./projectManagerAgent.types";
import { MOODBOARD_ROOM_IDS } from "./rooms";

const COLOR_MOOD_IDS = ["mood_01", "mood_02", "mood_03", "mood_04", "mood_05"] as const;
type ColorMoodId = (typeof COLOR_MOOD_IDS)[number];

function isColorMoodId(id: string): id is ColorMoodId {
  return COLOR_MOOD_IDS.includes(id as ColorMoodId);
}

function firstValue(answers: QuizAnswers, key: string): string | undefined {
  const v = answers[key];
  if (!v || !Array.isArray(v) || v.length === 0) return undefined;
  return v[0];
}

/** Default rooms when none are provided (moodboard layout IDs for Design Concept). */
const DEFAULT_ROOMS: string[] = ["kitchen", "primary-bathroom", "living-family"];

export interface BuildCreativeDirectorInputOptions {
  /**
   * Room IDs for slot scoping. Can be:
   * - **Moodboard layout IDs** (e.g. from rooms.MOODBOARD_ROOM_IDS): kitchen, primary-bathroom, living-family, powder-room, etc. Use when wiring to Design Concept so slot keys match getRoomLayout(roomId).
   * - **Scope quiz IDs** (e.g. from answers["rooms"] or rooms.SCOPE_ROOM_IDS): kitchen, primary_bath, living, etc. Use when aligning with budget/scope only.
   * See agents/rooms.ts for the full lists (SCOPE_ROOM_IDS, MOODBOARD_ROOM_IDS) and SCOPE_TO_MOODBOARD_ROOM mapping.
   */
  rooms?: string[];
}

/**
 * Build Creative Director input from quiz answers.
 * Uses scoreQuiz for primaryArchetype and axis scores; reads color_mood from the last quiz question.
 */
export function buildCreativeDirectorInput(
  answers: QuizAnswers,
  options?: BuildCreativeDirectorInputOptions
): CreativeDirectorInput {
  const styleResult = scoreQuiz(answers as Record<string, string | string[]>);

  const colorMoodRaw = firstValue(answers, "color_mood");
  const color_mood = colorMoodRaw && isColorMoodId(colorMoodRaw) ? colorMoodRaw : undefined;

  const exteriorStyle = firstValue(answers, "home_exterior_style");

  const rooms = options?.rooms ?? DEFAULT_ROOMS;

  return {
    primaryArchetype: styleResult.primaryArchetype,
    modernRustic: styleResult.modernRustic,
    minimalLayered: styleResult.minimalLayered,
    brightMoody: styleResult.brightMoody,
    rooms,
    color_mood,
    exteriorStyle,
    answers,
  };
}
