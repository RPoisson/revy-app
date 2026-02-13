// src/lib/moodboard/useMoodboard.ts
import { useMemo } from "react";
import { LAYOUT_V1, withComputedRects } from "@/lib/moodboard/layoutSpec";
import type { SlotId } from "@/lib/moodboard/materialRules";
import type { PaintMood } from "@/lib/moodboard/materialRules";
import { MATERIAL_SPECS_V1, selectForSlots } from "@/lib/moodboard/materialRules";

export type MoodboardContext = {
  archetype: "Parisian" | "Provincial" | "Mediterranean";
  expression?:
    | "Modern Expression"
    | "Balanced Expression (Timeless Fresh)"
    | "Rustic Expression";
  conditions?: (
    | "budget_low"
    | "budget_sensitive"
    | "builder_grade"
    | "renter"
    | "moody"
    | "budget_pressure"
  )[];
  /**
   * Drives paint selection (4 chips) from MATERIAL_SPECS_V1 Paint candidates.
   */
  paintMood?: PaintMood;
};

export type SlotContent =
  | { kind: "image"; src: string }
  | { kind: "color"; hex: string; label?: string };

export type UseMoodboardArgs = {
  ctx: MoodboardContext;

  /**
   * Optional: provide 4 palette colors (hex) to override paint slots immediately.
   * If provided, these take precedence over paintMood candidate images.
   */
  palette?: string[]; // [paint_1..paint_4]

  /**
   * Optional: preselected material image URLs keyed by slot.
   * This lets you wire real content incrementally (even before rules engine exists).
   *
   * NOTE: Slots must match updated SlotId list (stone_1/stone_2; no wall_detail).
   */
  materialImages?: Partial<
    Record<Exclude<SlotId, "paint_1" | "paint_2" | "paint_3" | "paint_4">, string>
  >;

  /**
   * Optional placeholder image for missing materials
   */
  placeholderImageSrc?: string;

  /**
   * If true, auto-fills any missing non-paint slots with placeholder image.
   * Default: true (keeps rendering stable).
   */
  fillMissingWithPlaceholder?: boolean;

  /**
   * If true, uses MATERIAL_SPECS_V1 + selectForSlots to populate missing slots
   * with repo image paths (when available). This is a lightweight “v0 engine”.
   * Default: true.
   */
  useCandidateSelection?: boolean;

  /**
   * Base path for repo-served moodboard reference images.
   * Default: "/moodboard_refs/v1"
   */
  repoBasePath?: string;
};

const DEFAULT_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <rect width="100%" height="100%" fill="rgba(17,17,17,0.06)"/>
  </svg>
`);

function joinPath(base: string, folder: string, fileName: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const f = folder.startsWith("/") ? folder.slice(1) : folder;
  const name = fileName.startsWith("/") ? fileName.slice(1) : fileName;
  return `${b}/${f}/${name}`;
}

/**
 * Very small mapping from slot/category to folder.
 * This keeps useMoodboard independent from the future “composition engine”.
 */
function folderForSlot(slot: SlotId): string {
  if (slot.startsWith("paint_")) return "paint";
  if (slot === "wood_floor") return "wood_flooring";
  if (slot === "wood_accent") return "accent_wood";
  if (slot === "metal") return "metal";
  if (slot === "textile_1" || slot === "textile_2") return "textile";
  if (slot === "stone_1" || slot === "stone_2") return "stone_slab";
  // tiles (tile_1..tile_2 are flooring; tile_3..tile_4 are wall tile)
  if (slot === "tile_1" || slot === "tile_2") return "flooring";
  return "wall_tile";
}

export function useMoodboard(args: UseMoodboardArgs) {
  const {
    ctx,
    palette = [],
    materialImages = {},
    placeholderImageSrc = DEFAULT_PLACEHOLDER,
    fillMissingWithPlaceholder = true,
    useCandidateSelection = true,
    repoBasePath = "/moodboard_refs/v1",
  } = args;

  const layout = useMemo(() => withComputedRects(LAYOUT_V1), []);

  const slots = useMemo<Partial<Record<SlotId, SlotContent>>>(() => {
    const out: Partial<Record<SlotId, SlotContent>> = {};

    // 1) Paint slots: if palette hexes provided, they win (immediate UX).
    const paintIds: SlotId[] = ["paint_1", "paint_2", "paint_3", "paint_4"];
    paintIds.forEach((id, i) => {
      const hex = palette[i];
      if (hex) out[id] = { kind: "color", hex };
    });

    // 2) Material image slots (manual overrides)
    (Object.keys(materialImages) as SlotId[]).forEach((id) => {
      const src = materialImages[id as keyof typeof materialImages];
      if (src) out[id] = { kind: "image", src };
    });

    // 3) Candidate selection fallback (fills missing slots with repo image paths)
    if (useCandidateSelection) {
      const selection = selectForSlots(MATERIAL_SPECS_V1 as any, {
        archetype: ctx.archetype,
        expression: ctx.expression,
        conditions: ctx.conditions,
        paintMood: ctx.paintMood,
      });

      (Object.keys(selection) as SlotId[]).forEach((slotId) => {
        // Respect manual overrides already set
        if (out[slotId]) return;

        const picked = selection[slotId]?.candidate;
        if (!picked) return;

        // If palette hex provided, do not override paint slots with images
        if (slotId.startsWith("paint_") && palette.length > 0) return;

        const asset = (picked.assetRefs ?? [])[0];
        if (!asset?.fileName) return;

        const folder = folderForSlot(slotId);
        const src = joinPath(repoBasePath, folder, asset.fileName);
        out[slotId] = { kind: "image", src };
      });
    }

    // 4) Optionally fill remaining non-paint slots with placeholder image
    if (fillMissingWithPlaceholder) {
      const nonPaintIds: SlotId[] = [
        "wood_floor",
        "stone_1",
        "stone_2",
        "textile_1",
        "textile_2",
        "wood_accent",
        "metal",
        "tile_1",
        "tile_2",
        "tile_3",
        "tile_4",
      ];

      nonPaintIds.forEach((id) => {
        if (!out[id]) out[id] = { kind: "image", src: placeholderImageSrc };
      });

      // If no palette provided and candidate selection didn't fill paint slots, keep paint slots undefined
      // so renderer can show empty chip placeholders (if it does) or just leave them blank.
    }

    return out;
  }, [
    ctx.archetype,
    ctx.expression,
    ctx.conditions,
    ctx.paintMood,
    palette,
    materialImages,
    placeholderImageSrc,
    fillMissingWithPlaceholder,
    useCandidateSelection,
    repoBasePath,
  ]);

  return { layout, slots };
}
