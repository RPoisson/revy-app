// src/lib/moodboard/layoutSpec.ts

export const MOODBOARD_LAYOUT_VERSION = "1.0.0" as const;

/**
 * Updated to reflect current V1 composition:
 * - Remove wall_detail slot (you removed wall detail from moodboard)
 * - Split stone into stone_1 + stone_2 (2 stone slabs on board)
 *
 * Notes:
 * - paint_* and tile_* remain computed.
 * - tileBand still holds 4 tiles total (2 floor + 2 wall). The renderer can label/group them,
 *   but layout just positions 4 equal tiles.
 */
export type SlotId =
  | "wood_floor"
  | "stone_1"
  | "stone_2"
  | "textile_1"
  | "textile_2"
  | "wood_accent"
  | "metal"
  | "paint_1"
  | "paint_2"
  | "paint_3"
  | "paint_4"
  | "tile_1"
  | "tile_2"
  | "tile_3"
  | "tile_4";

export type Rect = { x: number; y: number; w: number; h: number }; // normalized 0..1

export type SlotGroup = "hero" | "accents" | "paint" | "tiles" | "textiles" | "stone";

export type SlotLayout = {
  id: SlotId;
  rect: Rect;
  z: number;
  allowOverlap?: boolean;
  group?: SlotGroup;
};

export type MoodboardLayoutSpec = {
  id: string;
  version: typeof MOODBOARD_LAYOUT_VERSION;
  aspectRatio: number; // e.g. 3/2
  background: string; // should match CSS: #f8f5ee
  padding: { x: number; y: number };

  paintStrip: {
    rect: Rect;
    innerPadding: number;
    background: string; // #fff
    outline: string; // #fff
    /** vertical gap between chips (normalized) */
    chipGap: number;
    /** number of paint chips */
    count: 4;
  };

 tileBand: {
  // Sits under the hero cluster + stones + textiles + accents
  // and stops before the paint strip (paintStrip starts at x: 0.87)
  rect: { x: number; y: number; w: number; h: number }; 
    count: number;
    gap: number;
    centerJustified: boolean;
},



  /**
   * Slots are stored as a Record to guarantee:
   * - every SlotId exists exactly once
   * - no duplicates / missing slots
   */
  slots: Record<SlotId, SlotLayout>;
};

/**
 * Base layout with computed slots omitted only where derived.
 * Keep paint_* and tile_* rects as placeholders here and compute via withComputedRects().
 */
export const LAYOUT_V1: MoodboardLayoutSpec = {
  id: "layout_v1_landscape_editorial",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },

  paintStrip: {
    rect: { x: 0.87, y: 0.12, w: 0.10, h: 0.62 },
    innerPadding: 0.012,
    background: "#ffffff",
    outline: "#ffffff",
    chipGap: 0.02,
    count: 4,
  },

  tileBand: {
    rect: { x: 0.04, y: 0.78, w: 0.92, h: 0.18 },
    count: 4,
    gap: 0.03,
    centerJustified: true,
  },

  slots: {
    // HERO: wood floor (large) + stones (two squares)
    wood_floor: {
      id: "wood_floor",
      group: "hero",
      rect: { x: 0.06, y: 0.16, w: 0.26, h: 0.34 },
      z: 10,
      allowOverlap: true,
    },

    // Two stone squares stacked/offset over the hero area
    // Two stone squares — larger, pushed right, overlapping floor + page edge
stone_1: {
  id: "stone_1",
  group: "stone",
  rect: { x: 0.18, y: 0.35, w: 0.18, h: 0.18 }, // larger + right
  z: 26,
  allowOverlap: true,
},
stone_2: {
  id: "stone_2",
  group: "stone",
  rect: { x: 0.26, y: 0.22, w: 0.18, h: 0.18 }, // offset stack
  z: 25,
  allowOverlap: true,
},

    // TEXTILES: two swatches near the right-middle of the hero cluster
    textile_1: {
      id: "textile_1",
      group: "textiles",
      rect: { x: 0.48, y: 0.18, w: 0.10, h: 0.12 },
      z: 20,
      allowOverlap: true,
    },
    textile_2: {
      id: "textile_2",
      group: "textiles",
      rect: { x: 0.48, y: 0.36, w: 0.10, h: 0.12 },
      z: 15,
      allowOverlap: true,
    },

    // ACCENTS: wood accent above metal
    wood_accent: {
      id: "wood_accent",
      group: "accents",
      rect: { x: 0.68, y: 0.18, w: 0.10, h: 0.12 },
      z: 10,
    },
    metal: {
      id: "metal",
      group: "accents",
      rect: { x: 0.68, y: 0.36, w: 0.10, h: 0.12 }, // rectangle
      z: 10,
    },

    // PAINT (computed)
    paint_1: { id: "paint_1", group: "paint", rect: { x: 0, y: 0, w: 0, h: 0 }, z: 5 },
    paint_2: { id: "paint_2", group: "paint", rect: { x: 0, y: 0, w: 0, h: 0 }, z: 5 },
    paint_3: { id: "paint_3", group: "paint", rect: { x: 0, y: 0, w: 0, h: 0 }, z: 5 },
    paint_4: { id: "paint_4", group: "paint", rect: { x: 0, y: 0, w: 0, h: 0 }, z: 5 },

    // TILES (computed) — total 4 tiles (2 floor + 2 wall)
    tile_1: { id: "tile_1", group: "tiles", rect: { x: 0, y: 0, w: 0, h: 0 }, z: 1 },
    tile_2: { id: "tile_2", group: "tiles", rect: { x: 0, y: 0, w: 0, h: 0 }, z: 1 },
    tile_3: { id: "tile_3", group: "tiles", rect: { x: 0, y: 0, w: 0, h: 0 }, z: 1 },
    tile_4: { id: "tile_4", group: "tiles", rect: { x: 0, y: 0, w: 0, h: 0 }, z: 1 },
  },
} as const;

/**
 * Returns a new spec with computed rects for:
 * - paint_1..paint_4 inside paintStrip
 * - tile_1..tile_4 centered in tileBand
 *
 * No JSON cloning; preserves types and avoids foot-guns.
 */
export function withComputedRects(spec: MoodboardLayoutSpec): MoodboardLayoutSpec {
  const paintIds: SlotId[] = ["paint_1", "paint_2", "paint_3", "paint_4"];
  const tileIds: SlotId[] = ["tile_1", "tile_2", "tile_3", "tile_4"];

  // --- Compute paint chip rects ---
  const strip = spec.paintStrip.rect;
  const pad = spec.paintStrip.innerPadding;
  const gap = spec.paintStrip.chipGap;
  const count = spec.paintStrip.count;

  const chipW = strip.w - pad * 2;

  // Fit chips to available height deterministically:
  // totalHeight = count*chipH + (count-1)*gap  <= (strip.h - 2*pad)
  const availableH = strip.h - pad * 2;
  const chipH = (availableH - (count - 1) * gap) / count;

  const paintSlots: Partial<Record<SlotId, SlotLayout>> = {};
  paintIds.forEach((id, i) => {
    paintSlots[id] = {
      ...spec.slots[id],
      rect: {
        x: strip.x + pad,
        y: strip.y + pad + i * (chipH + gap),
        w: chipW,
        h: chipH,
      },
    };
  });

  // --- Compute tile rects (size matches stone square size) ---
  const band = spec.tileBand.rect;
  const tileGap = spec.tileBand.gap;
  const tileCount = spec.tileBand.count;

  // Single source of truth: tile size == stone square width
  // Prefer stone_1 as the canonical stone size.
  const stoneRect = spec.slots.stone_1.rect;
  const tileSize = stoneRect.w; // stone is square; use width

  const totalW = tileCount * tileSize + (tileCount - 1) * tileGap;
  const x0 = band.x + (band.w - totalW) / 2;
  const y0 = band.y + (band.h - tileSize) / 2;

  const tileSlots: Partial<Record<SlotId, SlotLayout>> = {};
  tileIds.forEach((id, i) => {
    tileSlots[id] = {
      ...spec.slots[id],
      rect: { x: x0 + i * (tileSize + tileGap), y: y0, w: tileSize, h: tileSize },
    };
  });

  return {
    ...spec,
    slots: {
      ...spec.slots,
      ...paintSlots,
      ...tileSlots,
    },
  };
}
