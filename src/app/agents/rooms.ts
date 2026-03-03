// src/app/agents/rooms.ts
// Canonical room IDs for Creative Director input (options.rooms). Two name spaces in the app.
// Bathroom config (tub/shower) drives moodboard layout and CD slot selection.

import type { BathroomConfigId } from "@/app/quiz/scope/questions";

/**
 * **Scope quiz room IDs** — from "Which spaces are you building or updating?" (quiz/scope/questions.ts).
 * Stored in answers["rooms"]. Used by budget heuristics (ROOM_POINTS) and brief rules.
 * Use these when building CD input from scope/quiz answers so budget and scope stay aligned.
 */
export const SCOPE_ROOM_IDS = [
  "entry",
  "living",
  "family",
  "dining",
  "kitchen",
  "laundry",
  "office",
  "primary_bath",
  "guest_bath",
  "powder",
  "secondary_bath",
  "kids_bath",
  "primary_bedroom",
  "nursery_bedroom",
  "child_bedroom",
  "teen_bedroom",
  "outdoor",
] as const;

export type ScopeRoomId = (typeof SCOPE_ROOM_IDS)[number];

/**
 * **Moodboard layout room IDs** — from Design Concept room layouts (designconcept/roomLayouts.ts ALL_ROOMS).
 * Used by getRoomLayout(roomId) and the moodboard room selector. Use these when wiring CD → Studio Coordinator
 * so the selected room matches a layout (e.g. primary-bathroom, kitchen, living-family).
 */
export const MOODBOARD_ROOM_IDS = [
  "kitchen",
  "primary-bathroom",
  "primary-bathroom-no-tub",
  "guest-kids-bath",
  "guest-kids-bath-tub-shower",
  "powder-room",
  "living-family",
  "dining-room",
  "laundry",
  "entry-foyer",
  "home-office",
  "bedrooms",
] as const;

export type MoodboardRoomId = (typeof MOODBOARD_ROOM_IDS)[number];

/**
 * Map scope room option IDs to moodboard layout IDs (one-to-one or one-to-many where a scope room
 * can use different layouts). Use when deriving options.rooms from answers["rooms"] for the
 * Design Concept flow so CD output keys (e.g. slotId|roomId) match getRoomLayout(roomId).
 */
export const SCOPE_TO_MOODBOARD_ROOM: Partial<Record<ScopeRoomId, MoodboardRoomId[]>> = {
  kitchen: ["kitchen"],
  primary_bath: ["primary-bathroom", "primary-bathroom-no-tub"],
  guest_bath: ["guest-kids-bath", "guest-kids-bath-tub-shower"],
  kids_bath: ["guest-kids-bath", "guest-kids-bath-tub-shower"],
  powder: ["powder-room"],
  secondary_bath: ["guest-kids-bath", "powder-room"],
  living: ["living-family"],
  family: ["living-family"],
  dining: ["dining-room"],
  laundry: ["laundry"],
  entry: ["entry-foyer"],
  office: ["home-office"],
  primary_bedroom: ["bedrooms"],
  nursery_bedroom: ["bedrooms"],
  child_bedroom: ["bedrooms"],
  teen_bedroom: ["bedrooms"],
};

/** Scope room IDs that have a bathroom tub/shower config question. */
export const BATHROOM_SCOPE_ROOM_IDS: ScopeRoomId[] = [
  "primary_bath",
  "guest_bath",
  "secondary_bath",
  "kids_bath",
];

/**
 * Map scope bathroom room + tub/shower config to the moodboard layout ID.
 * Used by Studio Coordinator to pick the right layout (e.g. primary-bathroom-no-tub vs primary-bathroom).
 * CD uses this to know which slots to fill: shower_floor, alcove_tub, freestanding_tub.
 */
export function getMoodboardLayoutIdForBathroom(
  scopeRoomId: ScopeRoomId,
  config: BathroomConfigId | undefined
): MoodboardRoomId {
  if (scopeRoomId === "primary_bath") {
    if (config === "shower_only") return "primary-bathroom-no-tub";
    return "primary-bathroom"; // tub_and_shower_combined | tub_and_shower_separate
  }
  if (
    scopeRoomId === "guest_bath" ||
    scopeRoomId === "secondary_bath" ||
    scopeRoomId === "kids_bath"
  ) {
    if (config === "tub_and_shower_combined") return "guest-kids-bath-tub-shower";
    return "guest-kids-bath"; // shower_only | tub_and_shower_separate (layout shows both)
  }
  if (scopeRoomId === "powder") return "powder-room";
  return "guest-kids-bath";
}
