// Builds the list of moodboard "rooms" from scope quiz answers.
// Each item has a display name from "Name each space" (custom or default) for the selector and "X Concept" label.

import type { QuizAnswers } from "@/app/quiz/lib/answersStore";
import {
  roomNamesKey,
  bathroomConfigKey,
  ROOM_OPTION_LABELS,
  BATHROOM_CONFIG_ROOM_IDS,
  type BathroomConfigId,
} from "@/app/quiz/scope/questions";
import {
  getMoodboardLayoutIdForBathroom,
  SCOPE_TO_MOODBOARD_ROOM,
  type ScopeRoomId,
  type MoodboardRoomId,
} from "@/app/agents/rooms";

function qtyKey(optionId: string): string {
  return `rooms_qty_${optionId}`;
}

function getRoomCount(answers: QuizAnswers, roomId: string): number {
  const v = answers[qtyKey(roomId)]?.[0];
  if (v === "7_plus") return 7;
  return Math.max(1, parseInt(String(v ?? "1"), 10) || 1);
}

export interface MoodboardRoomItem {
  id: string;
  layoutId: MoodboardRoomId;
  displayName: string;
}

/**
 * Build moodboard room list from scope answers. One entry per room instance.
 * displayName = custom name from "Name each space" or default (e.g. "Primary bathroom", "Guest bathroom (2)").
 * Use for RoomSelector label and for "X Concept" on the moodboard.
 */
export function buildMoodboardRoomsFromScope(answers: QuizAnswers): MoodboardRoomItem[] {
  const roomIds = (answers["rooms"] ?? []) as string[];
  const items: MoodboardRoomItem[] = [];

  for (const scopeRoomId of roomIds) {
    const count = getRoomCount(answers, scopeRoomId);
    const names = answers[roomNamesKey(scopeRoomId)] ?? [];
    const baseLabel = ROOM_OPTION_LABELS[scopeRoomId] ?? scopeRoomId;
    const isBathroomWithConfig = BATHROOM_CONFIG_ROOM_IDS.includes(
      scopeRoomId as (typeof BATHROOM_CONFIG_ROOM_IDS)[number]
    );
    const configs = (answers[bathroomConfigKey(scopeRoomId)] ?? []) as string[];

    for (let i = 0; i < count; i++) {
      const instanceLabel =
        count === 1 ? baseLabel : `${baseLabel} (${i + 1})`;
      const displayName = (names[i] && String(names[i]).trim()) || instanceLabel;
      let layoutId: MoodboardRoomId;

      if (isBathroomWithConfig) {
        const config = (configs[i] as BathroomConfigId | undefined) || "shower_only";
        layoutId = getMoodboardLayoutIdForBathroom(
          scopeRoomId as ScopeRoomId,
          config
        );
      } else {
        const layoutIds = SCOPE_TO_MOODBOARD_ROOM[scopeRoomId as ScopeRoomId];
        layoutId = (layoutIds?.[0] ?? "kitchen") as MoodboardRoomId;
      }

      items.push({
        id: `${scopeRoomId}_${i}`,
        layoutId,
        displayName,
      });
    }
  }

  return items;
}
