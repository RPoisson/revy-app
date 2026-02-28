// src/app/agents/productData.ts
// Product data layer for the Creative Director. Start with mock; replace with Supabase when ready.

import type { ProductCandidate } from "./projectManagerAgent.types";

/** Mock candidates for development and pipeline testing. Replace with DB query later. */
const MOCK_CANDIDATES_BY_SLOT: Record<string, ProductCandidate[]> = {
  lighting: [
    {
      id: "vendor.sconce_01",
      vendor: "vendor",
      vendor_sku: "sconce_01",
      slotId: "lighting",
      title: "Milk glass sconce",
      material: "glass",
      finish: "polished",
      metal_match_key: "brass",
      fixtureType: "sconce",
      tier: "Elevated",
      price: 180,
      currency: "USD",
    },
    {
      id: "vendor.sconce_02",
      vendor: "vendor",
      vendor_sku: "sconce_02",
      slotId: "lighting",
      title: "Fluted glass sconce",
      material: "glass",
      finish: "polished",
      metal_match_key: "brass",
      fixtureType: "sconce",
      tier: "Elevated",
      price: 220,
      currency: "USD",
    },
    {
      id: "vendor.overhead_01",
      vendor: "vendor",
      vendor_sku: "overhead_01",
      slotId: "lighting",
      title: "Linear overhead fixture",
      material: "metal",
      finish: "polished",
      metal_match_key: "nickel",
      fixtureType: "overhead",
      tier: "Value",
      price: 120,
      currency: "USD",
    },
  ],
  hardware: [
    {
      id: "vendor.pull_brass_01",
      vendor: "vendor",
      vendor_sku: "pull_brass_01",
      slotId: "hardware",
      title: "Brass cabinet pull",
      material: "brass",
      finish: "polished",
      metal_match_key: "brass",
      tier: "Elevated",
      price: 24,
      currency: "USD",
    },
    {
      id: "vendor.pull_nickel_01",
      vendor: "vendor",
      vendor_sku: "pull_nickel_01",
      slotId: "hardware",
      title: "Nickel cabinet pull",
      material: "metal",
      finish: "polished",
      metal_match_key: "nickel",
      tier: "Value",
      price: 18,
      currency: "USD",
    },
  ],
  tile_floor: [
    {
      id: "vendor.tile_marble_01",
      vendor: "vendor",
      vendor_sku: "tile_marble_01",
      slotId: "tile_floor",
      title: "Marble basketweave",
      material: "marble",
      finish: "honed",
      compatibility_key: "marble_grout_light",
      tier: "Luxury",
      price: 22,
      currency: "USD",
    },
    {
      id: "vendor.tile_porcelain_01",
      vendor: "vendor",
      vendor_sku: "tile_porcelain_01",
      slotId: "tile_floor",
      title: "Porcelain wood-look",
      material: "porcelain",
      finish: "matte",
      compatibility_key: "neutral_grout",
      tier: "Value",
      price: 8,
      currency: "USD",
    },
  ],
};

const SLOT_IDS = Object.keys(MOCK_CANDIDATES_BY_SLOT);

/**
 * Get product candidates for a slot. Used by the Creative Director.
 * Today: returns mock data. Later: query Supabase master_products by slot/category and filters.
 */
export function getCandidatesForSlot(
  slotKey: string,
  _filters?: { archetype?: string; material?: string; metalMatchKey?: string }
): ProductCandidate[] {
  const [baseSlotId, roomId] = slotKey.includes("|") ? slotKey.split("|") : [slotKey, undefined];
  const candidates = MOCK_CANDIDATES_BY_SLOT[baseSlotId] ?? [];
  return candidates.map((c) => ({
    ...c,
    slotId: baseSlotId,
    ...(roomId ? { roomId } : {}),
  }));
}

/** Get all slot keys that have mock data. Useful for CD to know which slots to fill. */
export function getMockSlotIds(): string[] {
  return [...SLOT_IDS];
}
