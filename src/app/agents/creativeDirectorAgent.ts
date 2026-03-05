// src/app/agents/creativeDirectorAgent.ts
// Creative Director agent: translates style input into ranked product candidates per slot.
// Uses STYLE_RENDER_MAP weights (3/2/1/-1) and axis scores to score candidates,
// enforces disallow lists as hard blockers, and scopes slots by input rooms.

import type {
  CreativeDirectorInput,
  CreativeDirectorOutput,
  PairingRule,
  ProductCandidate,
} from "./projectManagerAgent.types";
import { STYLE_RENDER_MAP } from "@/app/style/style_render_map";
import type { ArchetypeId } from "@/app/style/styleDNA";
import type { SlotId } from "@/app/style/style_render_map";
import { getCandidatesForSlot } from "./productData";

const MAX_CANDIDATES_PER_SLOT = 8;

// ─── Room → Slot mapping (moodboard layout IDs → slot IDs) ──────────────────

const ROOM_SLOTS: Record<string, SlotId[]> = {
  "kitchen":                      ["countertop", "tile_floor", "tile_wall", "lighting", "hardware"],
  "primary-bathroom":             ["tile_floor", "tile_wall", "tile_shower", "lighting", "vanity", "countertop", "hardware"],
  "primary-bathroom-no-tub":      ["tile_floor", "tile_wall", "tile_shower", "lighting", "vanity", "countertop", "hardware"],
  "guest-kids-bath":              ["tile_floor", "tile_wall", "tile_shower", "lighting", "vanity", "hardware"],
  "guest-kids-bath-tub-shower":   ["tile_floor", "tile_wall", "tile_shower", "lighting", "vanity", "hardware"],
  "powder-room":                  ["tile_floor", "tile_wall", "vanity", "hardware", "lighting"],
  "living-family":                ["tile_floor", "lighting"],
  "dining-room":                  ["lighting"],
  "entry-foyer":                  ["tile_floor", "lighting"],
  "laundry":                      ["tile_floor", "lighting", "hardware"],
  "home-office":                  ["lighting"],
  "bedrooms":                     ["lighting"],
};

const DEFAULT_SLOTS: SlotId[] = ["countertop", "tile_floor", "tile_wall", "lighting", "hardware"];

// ─── Strict disallow terms per archetype (X = hard blocker) ─────────────────
// Candidates whose searchable string matches any disallow term are excluded entirely.

const DISALLOW_TERMS: Record<string, string[]> = {
  parisian: [
    "farmhouse", "barnwood", "rope", "nautical", "boho", "tassels",
    "chunky proportions", "organic random", "visible craft",
    "rustic wood", "natural oak", "shaker doors",
  ],
  provincial: [
    "polished chrome", "ultra-slim", "floating box", "modern slab",
    "graphic contrast", "precision-focused", "symmetry-driven",
  ],
  mediterranean: [
    "shiny metal", "ornate fixture", "deco geometry", "barnwood",
    "furniture-style legs", "highly articulated millwork",
  ],
};

// ─── Axis-based modifier terms ────────────────────────────────────────────────
// When an axis leans strongly one direction, matching products get +1.

const AXIS_RUSTIC_TERMS = ["raw", "aged", "patina", "bush-hammered", "iron", "unlacquered", "visible grain", "forged", "blackened"];
const AXIS_MODERN_TERMS = ["polished", "smooth", "slim", "seamless", "crisp", "precise", "thin profile"];
const AXIS_MAXIMAL_TERMS = ["zellige", "patterned", "mosaic", "colored", "basketweave", "herringbone", "layered"];
const AXIS_MINIMAL_TERMS = ["plaster", "simple", "smooth", "monochrome", "plain", "floating"];
const AXIS_MOODY_TERMS = ["dark", "deep", "walnut", "bronze", "black", "blackened", "low", "soapstone"];
const AXIS_BRIGHT_TERMS = ["glass", "alabaster", "white", "light", "cream", "milk", "opaline"];

function buildSearchString(candidate: ProductCandidate): string {
  const styleTags = (candidate as ProductCandidate & { styleTags?: string[] }).styleTags ?? [];
  return [
    candidate.title,
    candidate.material,
    candidate.finish,
    candidate.finish_family,
    candidate.metal_match_key,
    candidate.fixtureType,
    ...styleTags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Score a candidate against the archetype's slot rules and axis modifiers.
 * Returns -Infinity if the candidate matches a hard disallow term.
 */
function scoreCandidate(
  candidate: ProductCandidate,
  slotId: SlotId,
  archetype: ArchetypeId,
  axes: { modernRustic: number; minimalLayered: number; brightMoody: number }
): number {
  const search = buildSearchString(candidate);

  // Hard disallow check — absolute blocker
  const disallowList = DISALLOW_TERMS[archetype] ?? [];
  for (const term of disallowList) {
    if (search.includes(term.toLowerCase())) {
      return -Infinity;
    }
  }

  const archetypeMap = STYLE_RENDER_MAP[archetype];
  if (!archetypeMap) return 0;

  const slotRules = archetypeMap.slots[slotId];
  if (!slotRules) return 0;

  let score = 0;

  // Weighted term matching (3 = Signature, 2 = Strong, 1 = Support, -1 = Avoid-lite)
  for (const { term, weight } of slotRules.include) {
    if (search.includes(term.toLowerCase())) {
      score += weight;
    }
  }

  // Soft avoids
  for (const avoid of slotRules.avoidLite ?? []) {
    if (search.includes(avoid.toLowerCase())) {
      score -= 0.5;
    }
  }

  // Axis modifiers: each matching term in the "leaning" direction adds +1
  const THRESHOLD = 0.35; // beyond this in either direction → apply modifier

  if (axes.modernRustic > 1 - THRESHOLD) {
    // Leaning rustic
    for (const t of AXIS_RUSTIC_TERMS) {
      if (search.includes(t)) score += 1;
    }
  } else if (axes.modernRustic < THRESHOLD) {
    // Leaning modern
    for (const t of AXIS_MODERN_TERMS) {
      if (search.includes(t)) score += 1;
    }
  }

  if (axes.minimalLayered > 1 - THRESHOLD) {
    // Leaning maximal
    for (const t of AXIS_MAXIMAL_TERMS) {
      if (search.includes(t)) score += 1;
    }
  } else if (axes.minimalLayered < THRESHOLD) {
    // Leaning minimal
    for (const t of AXIS_MINIMAL_TERMS) {
      if (search.includes(t)) score += 1;
    }
  }

  if (axes.brightMoody > 1 - THRESHOLD) {
    // Leaning moody
    for (const t of AXIS_MOODY_TERMS) {
      if (search.includes(t)) score += 1;
    }
  } else if (axes.brightMoody < THRESHOLD) {
    // Leaning bright
    for (const t of AXIS_BRIGHT_TERMS) {
      if (search.includes(t)) score += 1;
    }
  }

  return score;
}

/**
 * Build a deduplicated list of (slotId, roomId?) pairs from the input rooms.
 * Falls back to DEFAULT_SLOTS when a room has no mapping.
 */
function buildSlotPairs(rooms: string[]): { slotId: SlotId; roomId: string }[] {
  const seen = new Set<string>();
  const pairs: { slotId: SlotId; roomId: string }[] = [];

  const effectiveRooms = rooms.length > 0 ? rooms : ["kitchen", "primary-bathroom", "living-family"];

  for (const roomId of effectiveRooms) {
    const slots = ROOM_SLOTS[roomId] ?? DEFAULT_SLOTS;
    for (const slotId of slots) {
      const key = `${slotId}|${roomId}`;
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({ slotId, roomId });
      }
    }
  }

  return pairs;
}

/**
 * Build pairing rules for a given room: hardware ↔ lighting by metal_match_key,
 * tile_floor ↔ tile_wall by compatibility_key (when both slots exist in the room).
 */
function buildPairingRulesForRoom(roomId: string, slotIds: SlotId[]): PairingRule[] {
  const rules: PairingRule[] = [];
  const has = (s: SlotId) => slotIds.includes(s);

  if (has("hardware") && has("lighting")) {
    rules.push({
      slotKeyA: `hardware|${roomId}`,
      slotKeyB: `lighting|${roomId}`,
      matchBy: "metal_match_key",
    });
  }

  if (has("tile_floor") && has("tile_wall")) {
    rules.push({
      slotKeyA: `tile_floor|${roomId}`,
      slotKeyB: `tile_wall|${roomId}`,
      matchBy: "compatibility_key",
    });
  }

  return rules;
}

/**
 * Run the Creative Director.
 *
 * For each room × slot pair derived from input.rooms:
 *  1. Fetch all mock candidates for that slot.
 *  2. Score each candidate against STYLE_RENDER_MAP[archetype] and axis modifiers.
 *  3. Hard-block any that match the archetype's disallow list.
 *  4. Sort descending by score; keep top MAX_CANDIDATES_PER_SLOT (at least 1).
 *  5. Return candidatesBySlot keyed as "slotId|roomId" plus pairing rules.
 *
 * When input.adjustmentRequest is set, restricts output to the target slot
 * (and any paired slots) so the PM can re-run for just that slot.
 */
export function runCreativeDirector(input: CreativeDirectorInput): CreativeDirectorOutput {
  const archetype = (input.primaryArchetype as ArchetypeId) in STYLE_RENDER_MAP
    ? (input.primaryArchetype as ArchetypeId)
    : "provincial";

  const axes = {
    modernRustic: input.modernRustic,
    minimalLayered: input.minimalLayered,
    brightMoody: input.brightMoody,
  };

  const slotPairs = buildSlotPairs(input.rooms ?? []);

  // If adjustment mode: restrict to target slot + any slots it pairs with
  let filteredPairs = slotPairs;
  if (input.adjustmentRequest) {
    const targetKey = input.adjustmentRequest.target.slotKey;
    const [targetSlotId, targetRoomId] = targetKey.includes("|")
      ? targetKey.split("|")
      : [targetKey, undefined];

    filteredPairs = slotPairs.filter(({ slotId, roomId }) => {
      if (slotId === targetSlotId && (!targetRoomId || roomId === targetRoomId)) return true;
      // Include paired slots (hardware ↔ lighting, tile_floor ↔ tile_wall)
      if (targetSlotId === "hardware" && slotId === "lighting" && roomId === targetRoomId) return true;
      if (targetSlotId === "lighting" && slotId === "hardware" && roomId === targetRoomId) return true;
      if (targetSlotId === "tile_floor" && slotId === "tile_wall" && roomId === targetRoomId) return true;
      if (targetSlotId === "tile_wall" && slotId === "tile_floor" && roomId === targetRoomId) return true;
      return false;
    });
  }

  const candidatesBySlot: Record<string, ProductCandidate[]> = {};

  for (const { slotId, roomId } of filteredPairs) {
    const slotKey = `${slotId}|${roomId}`;
    const rawCandidates = getCandidatesForSlot(slotKey);

    // Score each candidate
    const scored = rawCandidates
      .map((c) => ({
        candidate: { ...c, roomId } as ProductCandidate,
        score: scoreCandidate(c, slotId, archetype, axes),
      }))
      .filter(({ score }) => score > -Infinity) // remove hard-blocked
      .sort((a, b) => b.score - a.score);

    // Guarantee at least one candidate — if all were disallowed, relax and take top by raw order
    const pool = scored.length > 0
      ? scored
      : rawCandidates.map((c) => ({ candidate: { ...c, roomId } as ProductCandidate, score: 0 }));

    candidatesBySlot[slotKey] = pool.slice(0, MAX_CANDIDATES_PER_SLOT).map((s) => s.candidate);
  }

  // Build pairing rules per room
  const pairingRules: PairingRule[] = [];
  const roomsProcessed = new Set<string>();

  for (const { slotId, roomId } of filteredPairs) {
    if (roomsProcessed.has(roomId)) continue;
    roomsProcessed.add(roomId);

    const slotsInRoom = filteredPairs
      .filter((p) => p.roomId === roomId)
      .map((p) => p.slotId);

    pairingRules.push(...buildPairingRulesForRoom(roomId, slotsInRoom));
  }

  return { candidatesBySlot, pairingRules };
}
