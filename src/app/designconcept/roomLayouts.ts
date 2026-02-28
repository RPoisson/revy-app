// Ported from Lovable moodboard-architect — exact layout specs per room.
// Used by Design Concept Detail moodboard (read-only canvas + room selector).

export const MOODBOARD_LAYOUT_VERSION = "1.0.0" as const;

export type Rect = { x: number; y: number; w: number; h: number };

export type SlotLayout = {
  id: string;
  label: string;
  rect: Rect;
  z: number;
  isPalette?: boolean;
  allowOverlap?: boolean;
};

export type PaletteStrip = {
  rect: Rect;
  innerPadding: number;
  background: string;
  outline: string;
  chipGap: number;
  count: number;
};

export type RoomLayoutSpec = {
  id: string;
  name: string;
  displayName?: string;
  version: typeof MOODBOARD_LAYOUT_VERSION;
  aspectRatio: number;
  background: string;
  padding: { x: number; y: number };
  paletteStrip: PaletteStrip;
  slots: Record<string, SlotLayout>;
};

const PALETTE_STRIP: PaletteStrip = {
  rect: { x: 0.87, y: 0.10, w: 0.10, h: 0.62 },
  innerPadding: 0.012,
  background: "#ffffff",
  outline: "#ffffff",
  chipGap: 0.02,
  count: 4,
};

const p = (id: string, label: string): SlotLayout => ({
  id,
  label,
  isPalette: true,
  rect: { x: 0, y: 0, w: 0, h: 0 },
  z: 5,
});

function computePaletteRects(
  strip: PaletteStrip,
  slotIds: string[],
  slots: Record<string, SlotLayout>
): Record<string, SlotLayout> {
  const pad = strip.innerPadding;
  const gap = strip.chipGap;
  const count = strip.count;
  const chipW = strip.rect.w - pad * 2;
  const availableH = strip.rect.h - pad * 2;
  const chipH = (availableH - (count - 1) * gap) / count;
  const result: Record<string, SlotLayout> = {};
  slotIds.forEach((id, i) => {
    result[id] = {
      ...slots[id],
      rect: {
        x: strip.rect.x + pad,
        y: strip.rect.y + pad + i * (chipH + gap),
        w: chipW,
        h: chipH,
      },
    };
  });
  return result;
}

export function withComputedRects(spec: RoomLayoutSpec): RoomLayoutSpec {
  const paletteIds = Object.keys(spec.slots).filter((id) => spec.slots[id].isPalette);
  const paletteSlots = computePaletteRects(spec.paletteStrip, paletteIds, spec.slots);
  return { ...spec, slots: { ...spec.slots, ...paletteSlots } };
}

// ─── Room layouts (exact from Lovable) ────────────────────────

export const KITCHEN: RoomLayoutSpec = {
  id: "kitchen",
  name: "Kitchen",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    flooring: { id: "flooring", label: "Flooring", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    countertop_slab: { id: "countertop_slab", label: "Countertop Slab", rect: { x: 0.183, y: 0.609, w: 0.20, h: 0.20 }, z: 20, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    cabinetry: { id: "cabinetry", label: "Cabinetry", rect: { x: 0.325, y: 0.647, w: 0.17, h: 0.204 }, z: 25 },
    cabinetry_2: { id: "cabinetry_2", label: "Cabinetry 2", rect: { x: 0.506, y: 0.649, w: 0.17, h: 0.204 }, z: 25 },
    cabinetry_3: { id: "cabinetry_3", label: "Cabinetry 3", rect: { x: 0.687, y: 0.65, w: 0.17, h: 0.204 }, z: 25 },
    range_hood: { id: "range_hood", label: "Range/Hood Insert", rect: { x: 0.292, y: 0.082, w: 0.14, h: 0.21 }, z: 15 },
    shelving: { id: "shelving", label: "Shelving", rect: { x: 0.564, y: 0.10, w: 0.14, h: 0.21 }, z: 25 },
    range: { id: "range", label: "Range", rect: { x: 0.382, y: 0.338, w: 0.14, h: 0.21 }, z: 25 },
    refrigerator: { id: "refrigerator", label: "Refrigerator/Freezer", rect: { x: 0.591, y: 0.348, w: 0.10, h: 0.20 }, z: 16 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.183, y: 0.306, w: 0.14, h: 0.21 }, z: 10 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.022, y: 0.137, w: 0.14, h: 0.21 }, z: 10 },
    backsplash: { id: "backsplash", label: "Backsplash Tile", rect: { x: 0.347, y: 0.183, w: 0.20, h: 0.20 }, z: 10 },
    sink: { id: "sink", label: "Sink", rect: { x: 0.745, y: 0.284, w: 0.10, h: 0.15 }, z: 1 },
    faucet: { id: "faucet", label: "Faucet", rect: { x: 0.757, y: 0.10, w: 0.075, h: 0.14 }, z: 1 },
    cabinet_pulls: { id: "cabinet_pulls", label: "Cabinet Pulls", rect: { x: 0.745, y: 0.475, w: 0.10, h: 0.15 }, z: 1 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const PRIMARY_BATHROOM: RoomLayoutSpec = {
  id: "primary-bathroom",
  name: "Bathroom (Separate shower / stand-alone tub)",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    floor_tile: { id: "floor_tile", label: "Main Floor Tile", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    countertop: { id: "countertop", label: "Countertop", rect: { x: 0.138, y: 0.597, w: 0.20, h: 0.20 }, z: 20, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    vanity_cabinet: { id: "vanity_cabinet", label: "Vanity Cabinet", rect: { x: 0.355, y: 0.504, w: 0.28, h: 0.336 }, z: 25 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.178, y: 0.299, w: 0.14, h: 0.21 }, z: 25 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.018, y: 0.136, w: 0.14, h: 0.21 }, z: 25 },
    freestanding_tub: { id: "freestanding_tub", label: "Freestanding Tub", rect: { x: 0.749, y: 0.541, w: 0.10, h: 0.15 }, z: 25 },
    shower_glass: { id: "shower_glass", label: "Shower Glass/Frame", rect: { x: 0.504, y: 0.079, w: 0.16, h: 0.16 }, z: 25 },
    shower_wall: { id: "shower_wall", label: "Shower Wall", rect: { x: 0.649, y: 0.204, w: 0.20, h: 0.20 }, z: 20 },
    shower_floor: { id: "shower_floor", label: "Shower Floor", rect: { x: 0.708, y: 0.341, w: 0.15, h: 0.15 }, z: 10 },
    sinks: { id: "sinks", label: "Sinks", rect: { x: 0.532, y: 0.291, w: 0.08, h: 0.12 }, z: 1 },
    faucets: { id: "faucets", label: "Faucets", rect: { x: 0.366, y: 0.248, w: 0.14, h: 0.21 }, z: 1 },
    mirrors: { id: "mirrors", label: "Mirrors", rect: { x: 0.277, y: 0.076, w: 0.14, h: 0.21 }, z: 1 },
    toilet: { id: "toilet", label: "Toilet", rect: { x: 0.652, y: 0.552, w: 0.08, h: 0.12 }, z: 15 },
    shower_fixtures: { id: "shower_fixtures", label: "Shower Fixtures", rect: { x: 0.707, y: 0.073, w: 0.14, h: 0.21 }, z: 25 },
    hardware: { id: "hardware", label: "Hardware", rect: { x: 0.65, y: 0.727, w: 0.06, h: 0.09 }, z: 25 },
    towel_hook: { id: "towel_hook", label: "Towel Hook", rect: { x: 0.724, y: 0.727, w: 0.06, h: 0.09 }, z: 16 },
    paper_holder: { id: "paper_holder", label: "Paper Holder", rect: { x: 0.801, y: 0.728, w: 0.06, h: 0.09 }, z: 15 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const GUEST_KIDS_BATH: RoomLayoutSpec = {
  id: "guest-kids-bath",
  name: "Bathroom (Shower only)",
  displayName: "Bathroom",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    floor_tile: { id: "floor_tile", label: "Main Floor Tile", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    countertop: { id: "countertop", label: "Countertop", rect: { x: 0.138, y: 0.597, w: 0.20, h: 0.20 }, z: 20, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    vanity_cabinet: { id: "vanity_cabinet", label: "Vanity Cabinet", rect: { x: 0.355, y: 0.504, w: 0.28, h: 0.336 }, z: 25 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.178, y: 0.299, w: 0.14, h: 0.21 }, z: 25 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.018, y: 0.136, w: 0.14, h: 0.21 }, z: 25 },
    shower_glass: { id: "shower_glass", label: "Shower Enclosure", rect: { x: 0.504, y: 0.079, w: 0.16, h: 0.16 }, z: 25 },
    shower_wall: { id: "shower_wall", label: "Shower Wall", rect: { x: 0.649, y: 0.204, w: 0.20, h: 0.20 }, z: 20 },
    shower_floor: { id: "shower_floor", label: "Shower Floor", rect: { x: 0.708, y: 0.341, w: 0.15, h: 0.15 }, z: 10 },
    sinks: { id: "sinks", label: "Sinks", rect: { x: 0.532, y: 0.291, w: 0.08, h: 0.12 }, z: 1 },
    faucets: { id: "faucets", label: "Faucets", rect: { x: 0.366, y: 0.248, w: 0.14, h: 0.21 }, z: 1 },
    mirrors: { id: "mirrors", label: "Mirrors", rect: { x: 0.277, y: 0.076, w: 0.14, h: 0.21 }, z: 1 },
    toilet: { id: "toilet", label: "Toilet", rect: { x: 0.675, y: 0.545, w: 0.08, h: 0.12 }, z: 15 },
    shower_fixtures: { id: "shower_fixtures", label: "Shower Fixtures", rect: { x: 0.707, y: 0.073, w: 0.14, h: 0.21 }, z: 25 },
    hardware: { id: "hardware", label: "Hardware", rect: { x: 0.688, y: 0.727, w: 0.06, h: 0.09 }, z: 25 },
    towel_hook: { id: "towel_hook", label: "Towel Hook", rect: { x: 0.775, y: 0.727, w: 0.06, h: 0.09 }, z: 16 },
    paper_holder: { id: "paper_holder", label: "Paper Holder", rect: { x: 0.774, y: 0.566, w: 0.06, h: 0.09 }, z: 15 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const POWDER_ROOM: RoomLayoutSpec = {
  id: "powder-room",
  name: "Powder Room",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    floor_tile: { id: "floor_tile", label: "Main Floor Tile", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.095, y: 0.071, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    countertop: { id: "countertop", label: "Countertop", rect: { x: 0.207, y: 0.594, w: 0.20, h: 0.20 }, z: 20, allowOverlap: true },
    vanity_cabinet: { id: "vanity_cabinet", label: "Vanity Cabinet/Pedestal", rect: { x: 0.423, y: 0.347, w: 0.40, h: 0.48 }, z: 25 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.214, y: 0.314, w: 0.14, h: 0.21 }, z: 25 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.026, y: 0.125, w: 0.14, h: 0.21 }, z: 25 },
    sink: { id: "sink", label: "Sink", rect: { x: 0.69, y: 0.086, w: 0.08, h: 0.12 }, z: 1 },
    faucet: { id: "faucet", label: "Faucet", rect: { x: 0.515, y: 0.082, w: 0.14, h: 0.21 }, z: 1 },
    mirror: { id: "mirror", label: "Mirror", rect: { x: 0.332, y: 0.083, w: 0.14, h: 0.21 }, z: 1 },
    toilet: { id: "toilet", label: "Toilet", rect: { x: 0.783, y: 0.151, w: 0.08, h: 0.12 }, z: 15 },
    hardware: { id: "hardware", label: "Hardware", rect: { x: 0.698, y: 0.239, w: 0.06, h: 0.09 }, z: 25 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const LIVING_FAMILY: RoomLayoutSpec = {
  id: "living-family",
  name: "Living / Family",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    flooring: { id: "flooring", label: "Flooring", rect: { x: 0.039, y: 0.558, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    fireplace: { id: "fireplace", label: "Fireplace Surround/Mantle", rect: { x: 0.406, y: 0.369, w: 0.20, h: 0.40 }, z: 20 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.435, y: 0.092, w: 0.14, h: 0.21 }, z: 15 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.665, y: 0.089, w: 0.14, h: 0.21 }, z: 14 },
    built_ins: { id: "built_ins", label: "Built-in Shelving/Millwork", rect: { x: 0.636, y: 0.371, w: 0.20, h: 0.40 }, z: 10 },
    wall_accent: { id: "wall_accent", label: "Wall Accents/Wallpaper", rect: { x: 0.163, y: 0.225, w: 0.20, h: 0.40 }, z: 5 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const DINING_ROOM: RoomLayoutSpec = {
  id: "dining-room",
  name: "Dining Room",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    flooring: { id: "flooring", label: "Flooring", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    built_ins: { id: "built_ins", label: "Built-in Shelving/Millwork", rect: { x: 0.46, y: 0.06, w: 0.14, h: 0.18 }, z: 20 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.46, y: 0.30, w: 0.14, h: 0.21 }, z: 15 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.66, y: 0.30, w: 0.14, h: 0.21 }, z: 14 },
    wainscoting: { id: "wainscoting", label: "Wainscoting/Wall Moulding", rect: { x: 0.66, y: 0.06, w: 0.14, h: 0.36 }, z: 10 },
    wall_accent: { id: "wall_accent", label: "Wall Accents/Wallpaper", rect: { x: 0.04, y: 0.56, w: 0.30, h: 0.24 }, z: 5 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const LAUNDRY: RoomLayoutSpec = {
  id: "laundry",
  name: "Laundry",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    tile_flooring: { id: "tile_flooring", label: "Tile Flooring", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    countertop_slab: { id: "countertop_slab", label: "Countertop Slab", rect: { x: 0.16, y: 0.60, w: 0.20, h: 0.20 }, z: 20, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    cabinetry: { id: "cabinetry", label: "Cabinetry", rect: { x: 0.388, y: 0.514, w: 0.28, h: 0.336 }, z: 25 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.181, y: 0.303, w: 0.14, h: 0.21 }, z: 25 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.011, y: 0.12, w: 0.14, h: 0.21 }, z: 25 },
    backsplash: { id: "backsplash", label: "Backsplash Tile", rect: { x: 0.61, y: 0.087, w: 0.20, h: 0.20 }, z: 20 },
    sink: { id: "sink", label: "Sink", rect: { x: 0.386, y: 0.286, w: 0.14, h: 0.21 }, z: 1 },
    faucet: { id: "faucet", label: "Faucet", rect: { x: 0.386, y: 0.057, w: 0.14, h: 0.21 }, z: 1 },
    cabinet_pulls: { id: "cabinet_pulls", label: "Cabinet Pulls", rect: { x: 0.576, y: 0.373, w: 0.06, h: 0.09 }, z: 25 },
    washer: { id: "washer", label: "Washer", rect: { x: 0.726, y: 0.368, w: 0.10, h: 0.15 }, z: 25 },
    dryer: { id: "dryer", label: "Dryer", rect: { x: 0.726, y: 0.571, w: 0.10, h: 0.15 }, z: 25 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const ENTRY_FOYER: RoomLayoutSpec = {
  id: "entry-foyer",
  name: "Entry / Foyer",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    flooring: { id: "flooring", label: "Flooring", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    interior_doors: { id: "interior_doors", label: "Interior Doors", rect: { x: 0.46, y: 0.06, w: 0.12, h: 0.18 }, z: 20 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.46, y: 0.30, w: 0.14, h: 0.21 }, z: 15 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.64, y: 0.30, w: 0.14, h: 0.21 }, z: 14 },
    stair_railing: { id: "stair_railing", label: "Stair Railing/Newel Posts", rect: { x: 0.64, y: 0.06, w: 0.16, h: 0.36 }, z: 10 },
    door_hardware: { id: "door_hardware", label: "Door Hardware", rect: { x: 0.04, y: 0.56, w: 0.14, h: 0.21 }, z: 5 },
    wall_accent: { id: "wall_accent", label: "Wall Accents/Wallpaper", rect: { x: 0.22, y: 0.56, w: 0.20, h: 0.24 }, z: 5 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const HOME_OFFICE: RoomLayoutSpec = {
  id: "home-office",
  name: "Home Office",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    flooring: { id: "flooring", label: "Flooring", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    built_ins: { id: "built_ins", label: "Built-in Shelving/Millwork", rect: { x: 0.46, y: 0.06, w: 0.20, h: 0.36 }, z: 20 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.70, y: 0.06, w: 0.14, h: 0.21 }, z: 15 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.70, y: 0.24, w: 0.14, h: 0.21 }, z: 14 },
    wall_accent: { id: "wall_accent", label: "Wall Accents/Wallpaper", rect: { x: 0.04, y: 0.56, w: 0.30, h: 0.24 }, z: 5 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const BEDROOMS: RoomLayoutSpec = {
  id: "bedrooms",
  name: "Bedroom(s)",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    flooring: { id: "flooring", label: "Flooring", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.46, y: 0.06, w: 0.14, h: 0.21 }, z: 20 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.64, y: 0.06, w: 0.14, h: 0.21 }, z: 19 },
    interior_doors: { id: "interior_doors", label: "Interior Doors", rect: { x: 0.46, y: 0.26, w: 0.12, h: 0.14 }, z: 15 },
    millwork: { id: "millwork", label: "Millwork", rect: { x: 0.64, y: 0.06, w: 0.14, h: 0.34 }, z: 10 },
    door_hardware: { id: "door_hardware", label: "Door Hardware", rect: { x: 0.04, y: 0.56, w: 0.14, h: 0.21 }, z: 5 },
    wall_accent: { id: "wall_accent", label: "Wall Accents/Wallpaper", rect: { x: 0.22, y: 0.56, w: 0.20, h: 0.24 }, z: 5 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const PRIMARY_BATHROOM_NO_TUB: RoomLayoutSpec = {
  id: "primary-bathroom-no-tub",
  name: "Bathroom (Shower only)",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    floor_tile: { id: "floor_tile", label: "Main Floor Tile", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    countertop: { id: "countertop", label: "Countertop", rect: { x: 0.138, y: 0.597, w: 0.20, h: 0.20 }, z: 20, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    vanity_cabinet: { id: "vanity_cabinet", label: "Vanity Cabinet", rect: { x: 0.355, y: 0.504, w: 0.28, h: 0.336 }, z: 25 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.178, y: 0.299, w: 0.14, h: 0.21 }, z: 25 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.018, y: 0.136, w: 0.14, h: 0.21 }, z: 25 },
    shower_glass: { id: "shower_glass", label: "Shower Glass/Frame", rect: { x: 0.504, y: 0.079, w: 0.16, h: 0.16 }, z: 25 },
    shower_wall: { id: "shower_wall", label: "Shower Wall", rect: { x: 0.649, y: 0.204, w: 0.20, h: 0.20 }, z: 20 },
    shower_floor: { id: "shower_floor", label: "Shower Floor", rect: { x: 0.708, y: 0.341, w: 0.15, h: 0.15 }, z: 10 },
    sinks: { id: "sinks", label: "Sinks", rect: { x: 0.532, y: 0.291, w: 0.08, h: 0.12 }, z: 1 },
    faucets: { id: "faucets", label: "Faucets", rect: { x: 0.366, y: 0.248, w: 0.14, h: 0.21 }, z: 1 },
    mirrors: { id: "mirrors", label: "Mirrors", rect: { x: 0.277, y: 0.076, w: 0.14, h: 0.21 }, z: 1 },
    toilet: { id: "toilet", label: "Toilet", rect: { x: 0.761, y: 0.55, w: 0.08, h: 0.12 }, z: 15 },
    shower_fixtures: { id: "shower_fixtures", label: "Shower Fixtures", rect: { x: 0.707, y: 0.073, w: 0.14, h: 0.21 }, z: 25 },
    hardware: { id: "hardware", label: "Hardware", rect: { x: 0.676, y: 0.723, w: 0.06, h: 0.09 }, z: 25 },
    towel_hook: { id: "towel_hook", label: "Towel Hook", rect: { x: 0.772, y: 0.72, w: 0.06, h: 0.09 }, z: 16 },
    paper_holder: { id: "paper_holder", label: "Paper Holder", rect: { x: 0.675, y: 0.563, w: 0.06, h: 0.09 }, z: 15 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const GUEST_KIDS_BATH_TUB_SHOWER: RoomLayoutSpec = {
  id: "guest-kids-bath-tub-shower",
  name: "Bathroom (Combined shower and alcove tub)",
  displayName: "Bathroom",
  version: MOODBOARD_LAYOUT_VERSION,
  aspectRatio: 3 / 2,
  background: "#f8f5ee",
  padding: { x: 0.04, y: 0.06 },
  paletteStrip: { ...PALETTE_STRIP, count: 4 },
  slots: {
    floor_tile: { id: "floor_tile", label: "Main Floor Tile", rect: { x: 0.04, y: 0.543, w: 0.28, h: 0.336 }, z: 10, allowOverlap: true },
    countertop: { id: "countertop", label: "Countertop", rect: { x: 0.138, y: 0.597, w: 0.20, h: 0.20 }, z: 20, allowOverlap: true },
    main_wall_finish: { id: "main_wall_finish", label: "Main Wall Finish", rect: { x: 0.041, y: 0.075, w: 0.20, h: 0.40 }, z: 10, allowOverlap: true },
    vanity_cabinet: { id: "vanity_cabinet", label: "Vanity Cabinet", rect: { x: 0.355, y: 0.504, w: 0.28, h: 0.336 }, z: 25 },
    lighting: { id: "lighting", label: "Lighting", rect: { x: 0.178, y: 0.299, w: 0.14, h: 0.21 }, z: 25 },
    lighting_2: { id: "lighting_2", label: "Lighting", rect: { x: 0.018, y: 0.136, w: 0.14, h: 0.21 }, z: 25 },
    shower_glass: { id: "shower_glass", label: "Shower Enclosure", rect: { x: 0.504, y: 0.079, w: 0.16, h: 0.16 }, z: 25 },
    tub: { id: "tub", label: "Tub", rect: { x: 0.737, y: 0.349, w: 0.10, h: 0.15 }, z: 25 },
    shower_wall: { id: "shower_wall", label: "Shower Wall", rect: { x: 0.649, y: 0.204, w: 0.20, h: 0.20 }, z: 20 },
    sinks: { id: "sinks", label: "Sinks", rect: { x: 0.532, y: 0.291, w: 0.08, h: 0.12 }, z: 1 },
    faucets: { id: "faucets", label: "Faucets", rect: { x: 0.366, y: 0.248, w: 0.14, h: 0.21 }, z: 1 },
    mirrors: { id: "mirrors", label: "Mirrors", rect: { x: 0.277, y: 0.076, w: 0.14, h: 0.21 }, z: 1 },
    toilet: { id: "toilet", label: "Toilet", rect: { x: 0.675, y: 0.545, w: 0.08, h: 0.12 }, z: 15 },
    shower_fixtures: { id: "shower_fixtures", label: "Shower Fixtures", rect: { x: 0.707, y: 0.073, w: 0.14, h: 0.21 }, z: 25 },
    hardware: { id: "hardware", label: "Hardware", rect: { x: 0.688, y: 0.727, w: 0.06, h: 0.09 }, z: 25 },
    towel_hook: { id: "towel_hook", label: "Towel Hook", rect: { x: 0.775, y: 0.727, w: 0.06, h: 0.09 }, z: 16 },
    paper_holder: { id: "paper_holder", label: "Paper Holder", rect: { x: 0.774, y: 0.566, w: 0.06, h: 0.09 }, z: 15 },
    logo_1: { id: "logo_1", label: "", rect: { x: 0.436, y: 0.868, w: 0.32, h: 0.1 }, z: 5 },
    logo_2: { id: "logo_2", label: "", rect: { x: 0.862, y: 0.805, w: 0.12, h: 0.16 }, z: 5 },
    ...Object.fromEntries(["palette_1", "palette_2", "palette_3", "palette_4"].map((id, i) => [id, p(id, `Palette ${i + 1}`)])),
  },
};

export const ALL_ROOMS: RoomLayoutSpec[] = [
  KITCHEN,
  PRIMARY_BATHROOM,
  PRIMARY_BATHROOM_NO_TUB,
  GUEST_KIDS_BATH,
  GUEST_KIDS_BATH_TUB_SHOWER,
  POWDER_ROOM,
  LIVING_FAMILY,
  DINING_ROOM,
  LAUNDRY,
  ENTRY_FOYER,
  HOME_OFFICE,
  BEDROOMS,
];

export function getRoomLayout(roomId: string): RoomLayoutSpec | undefined {
  return ALL_ROOMS.find((r) => r.id === roomId);
}
