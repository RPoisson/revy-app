// src/app/agents/materialSwapMaps.ts
// Swap maps for PM Agent: fiscal (Luxury→Value/Elevated), rental/flip (stone, metal, surfaces), finish tier.
// Aligned with materialRules.ts and budget tier semantics.

import type { MaterialTier } from "./projectManagerAgent.types";

/** Stone materials that require swap for rental (marble, limestone, terracotta → quartz, porcelain, quartzite, ceramic). */
export const RENTAL_STONE_SWAP_FROM = ["marble", "limestone", "terracotta"] as const;
export const RENTAL_STONE_SWAP_TO = ["quartz", "porcelain", "quartzite", "ceramic"] as const;

/** Metal finish tags that require swap for rental (unlacquered/raw → lacquered, PVD, polished). */
export const RENTAL_METAL_FINISH_FROM = ["unlacquered", "raw"] as const;
export const RENTAL_METAL_FINISH_TO = ["lacquered", "PVD", "polished"] as const;

/** Surface materials that require swap for rental (plaster, limewash → paint). */
export const RENTAL_SURFACE_SWAP_FROM = ["plaster", "limewash"] as const;
export const RENTAL_SURFACE_SWAP_TO = "paint" as const;

/** Material IDs considered Luxury tier for fiscal swap when budget is mismatch. */
export const LUXURY_MATERIAL_IDS = new Set<string>([
  "stone.calacatta",
  "stone.carrara",
  "stone.perla_venata",
  "stone.taj_mahal_quartzite",
  "stone.calacatta_lux_quartzite",
  "flooring.marble_basketweave",
  "flooring.marble_herringbone",
  "flooring.checkerboard_high_contrast_marble",
  "flooring.limestone_straight_laid",
  "flooring.terracotta_herringbone_antique",
  "wall_tile.contrasting_grout_marble_stack",
  "metal.brass_unlacquered",
]);

/** Value or Elevated equivalents by slot/category for fiscal downgrade (Luxury → Value/Elevated). */
export const FISCAL_DOWNGRADE_MAP: Record<string, string> = {
  "stone.calacatta": "stone.calacatta_lux_quartzite",
  "stone.carrara": "stone.quartz_soft_white",
  "stone.perla_venata": "stone.quartz_soft_white",
  "stone.taj_mahal_quartzite": "stone.quartz_soft_white",
  "stone.calacatta_lux_quartzite": "stone.quartz_soft_white",
  "flooring.marble_basketweave": "flooring.glazed_ceramic_basketweave",
  "flooring.marble_herringbone": "flooring.zellige_running_bond",
  "flooring.checkerboard_high_contrast_marble": "flooring.soft_checkerboard_cream_greige",
  "flooring.limestone_straight_laid": "flooring.zellige_square_grid",
  "flooring.terracotta_herringbone_antique": "flooring.zellige_running_bond",
  "wall_tile.contrasting_grout_marble_stack": "wall_tile.muted_zellige_grid",
  "metal.brass_unlacquered": "metal.brass_lacquered_gold",
};

/** Stone IDs that are rental-safe (no swap needed for investment_rental). */
export const RENTAL_SAFE_STONE_IDS = new Set<string>([
  "stone.quartz_soft_white",
  "stone.soapstone",
  "stone.virginia_mist_honed",
  "stone.calacatta_lux_quartzite",
  "stone.taj_mahal_quartzite",
]);

/** Metal IDs that are rental-safe (lacquered/PVD/polished). */
export const RENTAL_SAFE_METAL_IDS = new Set<string>([
  "metal.brass_lacquered_gold",
  "metal.french_gold",
  "metal.polished_nickel",
]);

/** Exotic stone IDs vetoed for Builder-Plus (Value); also used for Mid-Range kitchen veto. */
export const EXOTIC_STONE_IDS = new Set<string>([
  "stone.calacatta",
  "stone.perla_venata",
  "stone.taj_mahal_quartzite",
]);

/** Default overhead fixture id when 36-inch rule forces swap from sconce. */
export const OVERHEAD_FIXTURE_PLACEHOLDER_ID = "lighting.overhead_horizontal";
