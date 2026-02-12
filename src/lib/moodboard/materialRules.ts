// src/lib/moodboard/materialRules.v1.ts

export const MOODBOARD_RULES_VERSION = "1.1.0" as const;

/** ─────────────────────────────────────────────────────────────
 *  Types
 *  ───────────────────────────────────────────────────────────── */

export type Archetype = "Parisian" | "Provincial" | "Mediterranean";

export type Expression =
  | "Modern Expression"
  | "Balanced Expression (Timeless Fresh)"
  | "Rustic Expression";

export type Condition =
  | "budget_low"
  | "budget_sensitive"
  | "builder_grade"
  | "renter"
  | "moody"
  | "budget_pressure";

export type RuleStatus = "allowed" | "required" | "excluded";

export interface RuleFlag {
  condition?: Condition;
  status: RuleStatus;
  note: string;
}

/**
 * Paint is driven by a "color mood choice" (not archetype).
 * These map 1:1 to paint chip filenames.
 */
export type PaintMood = "neutral" | "contrast" | "moody" | "jewel_tone" | "mediterranean";

/**
 * Categories should reflect how you curate pools of candidates.
 * Adding "Wood Accent" keeps it distinct from flooring as requested.
 */
export type MaterialCategory =
  | "Paint"
  | "Wall Surface"
  | "Tile / Stone Wall Surface"
  | "Stone Slab"
  | "Stone & Tile Flooring"
  | "Wood Flooring"
  | "Wood Accent"
  | "Metal"
  | "Textile Accent";

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

export type AssetKind = "swatch" | "texture" | "photo" | "chip" | "fan_deck";

export interface AssetRef {
  /** stable reference id for asset */
  assetId: string;
  /** file name in repo or storage key in S3 */
  fileName: string;
  /** optional: where the file lives */
  location?: "repo" | "s3";
  kind?: AssetKind;
}

export interface Candidate {
  /** stable id used everywhere else (payload, selection, analytics) */
  id: string;
  label: string;
  tags?: string[];
  assetRefs?: AssetRef[];
  /** candidate eligible only when ALL are true */
  requires?: Condition[];
  /** candidate excluded when ANY are true */
  excludes?: Condition[];
}

export interface MaterialCategorySpec {
  category: MaterialCategory;

  /**
   * Editorial guidance (human-readable). Still useful for copy/rationale.
   * Only include keys that exist; no null/blanks.
   */
  content?: Partial<Record<Archetype | Expression, string>>;

  /**
   * Conditional constraints (enforced by engine).
   */
  rules?: RuleFlag[];

  /**
   * Structured candidates. This is what drives actual selection.
   *
   * Priority order in selection helper:
   * 1) Paint: byPaintMood (if provided)
   * 2) byArchetype (if provided)
   * 3) byExpression (if provided)
   * 4) default
   */
  candidates?: {
    byPaintMood?: Partial<Record<PaintMood, Candidate[]>>;
    byArchetype?: Partial<Record<Archetype, Candidate[]>>;
    byExpression?: Partial<Record<Expression, Candidate[]>>;
    /** global fallback candidates if nothing else matches */
    default?: Candidate[];
  };

  systemNotes?: string[];
}

/** ─────────────────────────────────────────────────────────────
 *  Slot plan (what categories fill what slots)
 *  ───────────────────────────────────────────────────────────── */

export type SlotFillRule = {
  slot: SlotId;
  category: MaterialCategory;
  count: 1; // V1: one item per slot
  preferredAssetKinds?: AssetKind[];
  /**
   * Slots in the same dedupeGroup will never return the same candidate.id.
   * This is how we guarantee:
   * - 4 paints are unique
   * - 2 textiles are unique
   * - 2 stones are unique
   * - 2 floor tiles are unique
   * - 2 wall tiles are unique
   */
  dedupeGroup?: "paint" | "textile" | "stone" | "tile_floor" | "tile_wall";
};

export const SLOT_PLAN_V1: SlotFillRule[] = [
  // Primary materials
  {
    slot: "wood_floor",
    category: "Wood Flooring",
    count: 1,
    preferredAssetKinds: ["photo", "texture", "swatch"],
  },

  // Stones: 2 unique
  {
    slot: "stone_1",
    category: "Stone Slab",
    count: 1,
    preferredAssetKinds: ["photo", "texture", "swatch"],
    dedupeGroup: "stone",
  },
  {
    slot: "stone_2",
    category: "Stone Slab",
    count: 1,
    preferredAssetKinds: ["photo", "texture", "swatch"],
    dedupeGroup: "stone",
  },

  // Textiles: enforce no duplicates
  {
    slot: "textile_1",
    category: "Textile Accent",
    count: 1,
    preferredAssetKinds: ["swatch", "photo", "texture"],
    dedupeGroup: "textile",
  },
  {
    slot: "textile_2",
    category: "Textile Accent",
    count: 1,
    preferredAssetKinds: ["swatch", "photo", "texture"],
    dedupeGroup: "textile",
  },

  // Accents: separate category for wood accent
  {
    slot: "wood_accent",
    category: "Wood Accent",
    count: 1,
    preferredAssetKinds: ["swatch", "photo", "texture"],
  },

  // Metal
  {
    slot: "metal",
    category: "Metal",
    count: 1,
    preferredAssetKinds: ["swatch", "photo", "texture"],
  },

  // Paints: enforce 4 unique (driven by paintMood)
  {
    slot: "paint_1",
    category: "Paint",
    count: 1,
    preferredAssetKinds: ["chip", "fan_deck", "swatch", "photo"],
    dedupeGroup: "paint",
  },
  {
    slot: "paint_2",
    category: "Paint",
    count: 1,
    preferredAssetKinds: ["chip", "fan_deck", "swatch", "photo"],
    dedupeGroup: "paint",
  },
  {
    slot: "paint_3",
    category: "Paint",
    count: 1,
    preferredAssetKinds: ["chip", "fan_deck", "swatch", "photo"],
    dedupeGroup: "paint",
  },
  {
    slot: "paint_4",
    category: "Paint",
    count: 1,
    preferredAssetKinds: ["chip", "fan_deck", "swatch", "photo"],
    dedupeGroup: "paint",
  },

  // Tiles: explicitly split 2 floor + 2 wall
  {
    slot: "tile_1",
    category: "Stone & Tile Flooring",
    count: 1,
    preferredAssetKinds: ["photo", "texture", "swatch"],
    dedupeGroup: "tile_floor",
  },
  {
    slot: "tile_2",
    category: "Stone & Tile Flooring",
    count: 1,
    preferredAssetKinds: ["photo", "texture", "swatch"],
    dedupeGroup: "tile_floor",
  },
  {
    slot: "tile_3",
    category: "Tile / Stone Wall Surface",
    count: 1,
    preferredAssetKinds: ["photo", "texture", "swatch"],
    dedupeGroup: "tile_wall",
  },
  {
    slot: "tile_4",
    category: "Tile / Stone Wall Surface",
    count: 1,
    preferredAssetKinds: ["photo", "texture", "swatch"],
    dedupeGroup: "tile_wall",
  },
];

/** ─────────────────────────────────────────────────────────────
 *  Minimal selection helper (optional but enables dedupe guarantees)
 *  ───────────────────────────────────────────────────────────── */

export type MoodboardContext = {
  archetype: Archetype;
  expression?: Expression;
  conditions?: Condition[];
  /**
   * Paint set is driven by "color mood choice" per your spec.
   */
  paintMood?: PaintMood;
};

export type SlotSelection = Record<
  SlotId,
  { slot: SlotId; category: MaterialCategory; candidate?: Candidate } // candidate can be undefined if pool is empty
>;

/**
 * Choose candidates per slot with dedupe guarantees across groups.
 *
 * NOTE: This helper:
 * - chooses from candidate pools
 * - respects requires/excludes at candidate level
 * - enforces dedupeGroup uniqueness
 * - tries preferredAssetKinds first (if assets exist)
 *
 * It does NOT implement RuleFlag gating across categories yet.
 */
export function selectForSlots(
  specs: MaterialCategorySpec[],
  ctx: MoodboardContext
): SlotSelection {
  const byCategory = new Map<MaterialCategory, MaterialCategorySpec>();
  for (const s of specs) byCategory.set(s.category, s);

  const usedByGroup = new Map<string, Set<string>>(); // dedupeGroup -> candidate.id set

  const pickFromPool = (
    pool: Candidate[],
    rule: SlotFillRule
  ): Candidate | undefined => {
    const conditions = new Set(ctx.conditions ?? []);
    const groupKey = rule.dedupeGroup;
    const used = groupKey ? usedByGroup.get(groupKey) ?? new Set<string>() : null;

    const eligible = pool.filter((c) => {
      // requires: all must be present
      if (c.requires && c.requires.some((req) => !conditions.has(req))) return false;
      // excludes: none may be present
      if (c.excludes && c.excludes.some((ex) => conditions.has(ex))) return false;
      // dedupe
      if (used && used.has(c.id)) return false;
      return true;
    });

    if (eligible.length === 0) return undefined;

    // Prefer candidates that actually have an assetRef of preferred kinds
    const kinds = rule.preferredAssetKinds ?? [];
    if (kinds.length > 0) {
      const withPreferredAsset = eligible.find((c) =>
        (c.assetRefs ?? []).some((a) => a.kind && kinds.includes(a.kind))
      );
      if (withPreferredAsset) return withPreferredAsset;
    }

    return eligible[0];
  };

  const resolvePool = (catSpec?: MaterialCategorySpec, category?: MaterialCategory): Candidate[] => {
    if (!catSpec?.candidates) return [];
    const { byPaintMood, byArchetype, byExpression, default: def } = catSpec.candidates;

    // Priority: Paint mood -> archetype -> expression -> default
    if (category === "Paint" && ctx.paintMood) {
      const pPool = (byPaintMood?.[ctx.paintMood] ?? []).slice();
      if (pPool.length > 0) return pPool;
    }

    const aPool = (byArchetype?.[ctx.archetype] ?? []).slice();
    if (aPool.length > 0) return aPool;

    if (ctx.expression) {
      const ePool = (byExpression?.[ctx.expression] ?? []).slice();
      if (ePool.length > 0) return ePool;
    }

    return (def ?? []).slice();
  };

  const out = {} as SlotSelection;

  for (const rule of SLOT_PLAN_V1) {
    const catSpec = byCategory.get(rule.category);
    const pool = resolvePool(catSpec, rule.category);

    const candidate = pickFromPool(pool, rule);

    if (rule.dedupeGroup && candidate) {
      const set = usedByGroup.get(rule.dedupeGroup) ?? new Set<string>();
      set.add(candidate.id);
      usedByGroup.set(rule.dedupeGroup, set);
    }

    out[rule.slot] = { slot: rule.slot, category: rule.category, candidate };
  }

  return out;
}

/** ─────────────────────────────────────────────────────────────
 *  Candidate library + rules (V1)
 *
 *  Filepath convention (repo):
 *  /public/moodboard_refs/v1/<category_folder>/<filename>
 *
 *  - Paint:        /paint/
 *  - Wood flooring:/wood_flooring/
 *  - Stone slab:   /stone_slab/
 *  - Flooring:     /flooring/
 *  - Wall tile:    /wall_tile/
 *  - Textile:      /textile/
 *  - Metal:        /metal/
 *  - Wood accent:  /accent_wood/
 *  ───────────────────────────────────────────────────────────── */

export const MATERIAL_SPECS_V1: readonly MaterialCategorySpec[] = [
  // ────────────────────────────────────────────────────────────
  // PAINT (driven by paintMood)
  // ────────────────────────────────────────────────────────────
  {
    category: "Paint",
    rules: [
      {
        status: "required",
        note: "paint details will be determined by the color mood choice with filenames.",
      },
    ],
    candidates: {
      byPaintMood: {
        neutral: [
          {
            id: "paint.wevet",
            label: "Wevet",
            assetRefs: [
              { assetId: "asset.paint.wevet", fileName: "paint_wevet.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.skimming_stone",
            label: "Skimming Stone",
            assetRefs: [
              { assetId: "asset.paint.skimming_stone", fileName: "paint_skimming_stone.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.schoolhouse_white",
            label: "School House White",
            assetRefs: [
              { assetId: "asset.paint.schoolhouse_white", fileName: "paint_schoolhouse_white.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.ammonite",
            label: "Ammonite",
            assetRefs: [
              { assetId: "asset.paint.ammonite", fileName: "paint_ammonite.jpg", location: "repo", kind: "chip" },
            ],
          },
        ],
        contrast: [
          {
            id: "paint.wevet",
            label: "Wevet",
            assetRefs: [
              { assetId: "asset.paint.wevet", fileName: "paint_wevet.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.ammonite",
            label: "Ammonite",
            assetRefs: [
              { assetId: "asset.paint.ammonite", fileName: "paint_ammonite.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.railings",
            label: "Railings",
            assetRefs: [
              { assetId: "asset.paint.railings", fileName: "paint_railings.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.down_pipe",
            label: "Down Pipe",
            assetRefs: [
              { assetId: "asset.paint.down_pipe", fileName: "paint_down_pipe.jpg", location: "repo", kind: "chip" },
            ],
          },
        ],
        moody: [
          {
            id: "paint.railings",
            label: "Railings",
            assetRefs: [
              { assetId: "asset.paint.railings", fileName: "paint_railings.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.paeean_black",
            label: "Paeean Black",
            assetRefs: [
              { assetId: "asset.paint.paeean_black", fileName: "paint_paeean_black.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.tanners_brown",
            label: "Tanners Brown",
            assetRefs: [
              { assetId: "asset.paint.tanners_brown", fileName: "paint_tanners_brown.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.down_pipe",
            label: "Down Pipe",
            assetRefs: [
              { assetId: "asset.paint.down_pipe", fileName: "paint_down_pipe.jpg", location: "repo", kind: "chip" },
            ],
          },
        ],
        jewel_tone: [
          {
            id: "paint.preference_red",
            label: "Preference Red",
            assetRefs: [
              { assetId: "asset.paint.preference_red", fileName: "paint_preference_red.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.inchyra_blue",
            label: "Inchyra Blue",
            assetRefs: [
              { assetId: "asset.paint.inchyra_blue", fileName: "paint_inchyra_blue.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.studio_green",
            label: "Studio Green",
            assetRefs: [
              { assetId: "asset.paint.studio_green", fileName: "paint_studio_green.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.pelt",
            label: "Pelt",
            assetRefs: [
              { assetId: "asset.paint.pelt", fileName: "paint_pelt.jpg", location: "repo", kind: "chip" },
            ],
          },
        ],
        mediterranean: [
          {
            id: "paint.wevet",
            label: "Wevet",
            assetRefs: [
              { assetId: "asset.paint.wevet", fileName: "paint_wevet.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.kittiwake",
            label: "Kittiwake",
            assetRefs: [
              { assetId: "asset.paint.kittiwake", fileName: "paint_kittiwake.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.oval_room_blue",
            label: "Oval Room Blue",
            assetRefs: [
              { assetId: "asset.paint.oval_room_blue", fileName: "paint_oval_room_blue.jpg", location: "repo", kind: "chip" },
            ],
          },
          {
            id: "paint.selvedge",
            label: "Selvedge",
            assetRefs: [
              { assetId: "asset.paint.selvedge", fileName: "paint_selvedge.jpg", location: "repo", kind: "chip" },
            ],
          },
        ],
      },
    },
    systemNotes: [
      "Paint chips are rendered as rounded rectangles stacked on right side of moodboard with names below.",
      "Paint assets live in /public/moodboard_refs/v1/paint/ (filenames listed above).",
    ],
  },

  // ────────────────────────────────────────────────────────────
  // WOOD FLOORING
  // ────────────────────────────────────────────────────────────
  {
    category: "Wood Flooring",
    content: {
      Parisian: "Dark walnut or oak; herringbone or chevron; refined finish",
      Provincial: "White oak hardwood; straight plank;",
      Mediterranean: "Whitewashed oak; white oak plank;",
      "Modern Expression": "Clean straight planks; minimal variation",
      "Balanced Expression (Timeless Fresh)": "Natural wood tone; subtle grain",
      "Rustic Expression": "Rough-sawn or reclaimed look; visible grain",
    },
    candidates: {
      byArchetype: {
        Parisian: [
          {
            id: "wood_floor.dark_walnut_herringbone",
            label: "Dark walnut or oak herringbone",
            assetRefs: [
              {
                assetId: "asset.wood_floor.dark_walnut_herringbone.01",
                fileName: "wood_flooring_dark_walnut_herringbone_01.jpg",
                location: "repo",
                kind: "photo",
              },
            ],
          },
        ],
        Provincial: [
          {
            id: "wood_floor.white_oak_straight_plank",
            label: "White oak straight plank",
            assetRefs: [
              {
                assetId: "asset.wood_floor.white_oak_straight_plank.01",
                fileName: "wood_flooring_white_oak_straight_plank_01.jpg",
                location: "repo",
                kind: "photo",
              },
            ],
          },
        ],
        Mediterranean: [
          {
            id: "wood_floor.whitewashed_oak_plank",
            label: "Whitewashed oak plank",
            assetRefs: [
              {
                assetId: "asset.wood_floor.whitewashed_oak_plank.01",
                fileName: "wood_flooring_whitewashed_oak_plank_01.jpg",
                location: "repo",
                kind: "photo",
              },
            ],
          },
        ],
      },
    },
  },

  // ────────────────────────────────────────────────────────────
  // STONE SLAB (nero mist removed)
  // ────────────────────────────────────────────────────────────
  {
    category: "Stone Slab",
    content: {
      Parisian:
        "Polished marble; thin profiles;  Calacatta or carrara, Calacatta lux quartzite, for moody: soapstone, or virginia mist honed, nero mist. If renter, no marble. If budget sensitive, no calacatta. If builder grade, no marble",
      Provincial:
        "Honed marble, perla venata, or taj mahal, Calacatta lux quartzite, for moody: soapstone, or virginia mist honed, nero mist. If renter, no marble.",
      Mediterranean:
        "Honed marble, polished marble, carrara, Calacatta lux quartzite, for moody: soapstone, or virginia mist honed, nero mist",
      "Modern Expression": "Polished marble; crisp edges; seamless joins",
      "Balanced Expression (Timeless Fresh)":
        "Honed limestone or marble; natural brass pairings",
      "Rustic Expression":
        "Bush-hammered stone; patina; thick organic profiles",
    },
    rules: [
      { condition: "renter", status: "excluded", note: "marble" },
      { condition: "builder_grade", status: "excluded", note: "marble" },
      { condition: "builder_grade", status: "required", note: "use quartzite or quartz" },
      { condition: "budget_sensitive", status: "excluded", note: "calacatta" },
      { condition: "budget_sensitive", status: "excluded", note: "exotic stones" },
      {
        condition: "moody",
        status: "required",
        note: "choose a dark stone option (soapstone or virginia mist honed)",
      },
    ],
    candidates: {
      // Broad pool; selection logic (later) will enforce constraints above.
      default: [
        {
          id: "stone.calacatta",
          label: "Calacatta",
          assetRefs: [
            { assetId: "asset.stone.calacatta.01", fileName: "stone_calacatta_01.jpg", location: "repo", kind: "photo" },
          ],
        },
        {
          id: "stone.carrara",
          label: "Carrara",
          assetRefs: [
            { assetId: "asset.stone.carrara.01", fileName: "stone_carrara_01.jpg", location: "repo", kind: "photo" },
          ],
        },
        {
          id: "stone.perla_venata",
          label: "Perla Venata",
          assetRefs: [
            { assetId: "asset.stone.perla_venata.01", fileName: "stone_perla_venata_01.jpg", location: "repo", kind: "photo" },
          ],
        },
        {
          id: "stone.taj_mahal_quartzite",
          label: "Taj Mahal Quartzite",
          assetRefs: [
            { assetId: "asset.stone.taj_mahal.01", fileName: "stone_taj_mahal_quartzite_01.jpg", location: "repo", kind: "photo" },
          ],
        },
        {
          id: "stone.calacatta_lux_quartzite",
          label: "Calacatta Lux Quartzite",
          assetRefs: [
            { assetId: "asset.stone.calacatta_lux.01", fileName: "stone_calacatta_lux_quartzite_01.jpg", location: "repo", kind: "photo" },
          ],
        },
        {
          id: "stone.soapstone",
          label: "Soapstone",
          assetRefs: [
            { assetId: "asset.stone.soapstone.01", fileName: "stone_soapstone_01.jpg", location: "repo", kind: "photo" },
          ],
        },
        {
          id: "stone.virginia_mist_honed",
          label: "Virginia Mist (honed)",
          assetRefs: [
            { assetId: "asset.stone.virginia_mist.01", fileName: "stone_virginia_mist_honed_01.jpg", location: "repo", kind: "photo" },
          ],
        },
        {
          id: "stone.quartz_soft_white",
          label: "Quartz (soft white)",
          assetRefs: [
            { assetId: "asset.stone.quartz_soft_white.01", fileName: "stone_quartz_soft_white_01.jpg", location: "repo", kind: "photo" },
          ],
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────────
  // STONE & TILE FLOORING
  // ────────────────────────────────────────────────────────────
  {
    category: "Stone & Tile Flooring",
    content: {
      Parisian:
        "Hero layouts: marble basketweave, marble herringbone, penny round with dot/floral motifs (always framed), high-contrast checkerboard marble. Rules: tight grout; crisp alignment; borders & symmetry encouraged; if budget low, use ceramic tile for at least one element.  If renter, no marble, limestone, or terracotta.",
      Provincial:
        "Hero layouts: terracotta herringbone (raw/antique); octagon + square (dot) stone (low contrast); straight-laid limestone or honed marble; soft checkerboard stone (cream/greige); antique hex with irregular edges. Rules: finish & patina > geometry; warm, visible grout; expected, if budget low, use ceramic tile for at least one element. If renter, no marble or limestone.",
      Mediterranean:
        "Hero layouts: glazed ceramic basketweave (square-stack/block); zellige square grid; small-scale mosaic (square/hex/irregular); brick or running bond zellige; patterned cement/encaustic Supporting: scallop/fish-scale (accent) Rules: variation mandatory; grout part of texture; borders rare; avoid sharp geometry or formal contrast. if budget low, use ceramic tile",
    },
    rules: [
      { condition: "budget_low", status: "excluded", note: "marble" },
      { condition: "budget_low", status: "required", note: "use ceramic tile for at least one element" },
      { condition: "renter", status: "excluded", note: "marble" },
      { condition: "renter", status: "excluded", note: "limestone" },
      { condition: "renter", status: "excluded", note: "terracotta" },
    ],
    candidates: {
      byArchetype: {
        Parisian: [
          {
            id: "flooring.marble_basketweave",
            label: "Marble basketweave",
            assetRefs: [
              { assetId: "asset.flooring.marble_basketweave.01", fileName: "flooring_marble_basketweave_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.marble_herringbone",
            label: "Marble herringbone",
            assetRefs: [
              { assetId: "asset.flooring.marble_herringbone.01", fileName: "flooring_marble_herringbone_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.penny_round_framed_motif",
            label: "Penny round framed motif",
            assetRefs: [
              { assetId: "asset.flooring.penny_round_framed_motif.01", fileName: "flooring_penny_round_framed_motif_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.checkerboard_high_contrast_marble",
            label: "High-contrast checkerboard marble",
            assetRefs: [
              { assetId: "asset.flooring.checkerboard_high_contrast.01", fileName: "flooring_checkerboard_high_contrast_marble_01.jpg", location: "repo", kind: "photo" },
            ],
          },
        ],
        Provincial: [
          {
            id: "flooring.terracotta_herringbone_antique",
            label: "Terracotta herringbone (raw/antique)",
            assetRefs: [
              { assetId: "asset.flooring.terracotta_herringbone.01", fileName: "flooring_terracotta_herringbone_antique_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.octagon_dot_low_contrast",
            label: "Octagon + square (dot) stone (low contrast)",
            assetRefs: [
              { assetId: "asset.flooring.octagon_dot.01", fileName: "flooring_octagon_dot_low_contrast_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.limestone_straight_laid",
            label: "Straight-laid limestone",
            assetRefs: [
              { assetId: "asset.flooring.limestone_straight_laid.01", fileName: "flooring_limestone_straight_laid_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.soft_checkerboard_cream_greige",
            label: "Soft checkerboard stone (cream/greige)",
            assetRefs: [
              { assetId: "asset.flooring.soft_checkerboard.01", fileName: "flooring_soft_checkerboard_cream_greige_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.antique_hex_irregular",
            label: "Antique hex with irregular edges",
            assetRefs: [
              { assetId: "asset.flooring.antique_hex.01", fileName: "flooring_antique_hex_irregular_01.jpg", location: "repo", kind: "photo" },
            ],
          },
        ],
        Mediterranean: [
          {
            id: "flooring.glazed_ceramic_basketweave",
            label: "Glazed ceramic basketweave",
            assetRefs: [
              { assetId: "asset.flooring.glazed_ceramic_basketweave.01", fileName: "flooring_glazed_ceramic_basketweave_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.zellige_square_grid",
            label: "Zellige square grid",
            assetRefs: [
              { assetId: "asset.flooring.zellige_square_grid.01", fileName: "flooring_zellige_square_grid_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.mosaic_small_scale_irregular",
            label: "Small-scale mosaic (irregular)",
            assetRefs: [
              { assetId: "asset.flooring.mosaic_irregular.01", fileName: "flooring_mosaic_small_scale_irregular_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.zellige_running_bond",
            label: "Brick / running bond zellige",
            assetRefs: [
              { assetId: "asset.flooring.zellige_running_bond.01", fileName: "flooring_zellige_running_bond_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.cement_encaustic_patterned",
            label: "Patterned cement / encaustic",
            assetRefs: [
              { assetId: "asset.flooring.cement_encaustic.01", fileName: "flooring_cement_encaustic_patterned_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "flooring.scallop_fishscale_accent",
            label: "Scallop / fish-scale (accent)",
            assetRefs: [
              { assetId: "asset.flooring.scallop_fishscale.01", fileName: "flooring_scallop_fishscale_accent_01.jpg", location: "repo", kind: "photo" },
            ],
          },
        ],
      },
    },
  },

  // ────────────────────────────────────────────────────────────
  // TILE / STONE WALL SURFACE
  // ────────────────────────────────────────────────────────────
  {
    category: "Tile / Stone Wall Surface",
    content: {
      Parisian: "Contrasting grout, marble overlay stack. If budget low, use ceramic tile",
      Provincial:
        "muted zellige grid; brick/offset layouts. , hex or penny tile, zio and sons. If budget low, use ceramic tile",
      Mediterranean: "Zellige mosaic, penny tile, if budget low, use ceramic tile",
    },
    rules: [
      { condition: "budget_low", status: "excluded", note: "marble" },
      { condition: "budget_low", status: "required", note: "ceramic tile" },
    ],
    candidates: {
      byArchetype: {
        Parisian: [
          {
            id: "wall_tile.contrasting_grout_marble_stack",
            label: "Contrasting grout, marble overlay stack",
            assetRefs: [
              { assetId: "asset.wall_tile.contrasting_grout_marble_stack.01", fileName: "wall_tile_contrasting_grout_marble_stack_01.jpg", location: "repo", kind: "photo" },
            ],
          },
        ],
        Provincial: [
          {
            id: "wall_tile.muted_zellige_grid",
            label: "Muted zellige grid",
            assetRefs: [
              { assetId: "asset.wall_tile.muted_zellige_grid.01", fileName: "wall_tile_muted_zellige_grid_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          
          {
            id: "wall_tile.hex_tile",
            label: "Hex tile",
            assetRefs: [
              { assetId: "asset.wall_tile.hex.01", fileName: "wall_tile_hex_tile_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          
        ],
        Mediterranean: [
          {
            id: "wall_tile.zellige_mosaic",
            label: "Zellige mosaic",
            assetRefs: [
              { assetId: "asset.wall_tile.zellige_mosaic.01", fileName: "wall_tile_zellige_mosaic_01.jpg", location: "repo", kind: "photo" },
            ],
          },
          {
            id: "wall_tile.penny_tile",
            label: "Penny tile",
            assetRefs: [
              { assetId: "asset.wall_tile.penny.01", fileName: "wall_tile_penny_tile_01.jpg", location: "repo", kind: "photo" },
            ],
          },
        ],
      },
    },
  },

  // ────────────────────────────────────────────────────────────
  // METAL (aged removed; french gold added)
  // ────────────────────────────────────────────────────────────
  {
    category: "Metal",
    content: {
      Parisian: "polished nickel;brass. if rental - laquered",
      Provincial: "Unlaquered brass. If rental - gold/laquered",
      Mediterranean: "Unlaquered brass. If rental - gold/laquered",
    },
    rules: [
      { condition: "renter", status: "excluded", note: "unlaquered metal" },
      { condition: "renter", status: "required", note: "lacquered / sealed" },
      { condition: "budget_pressure", status: "required", note: "polished nickel preferred" },
    ],
    candidates: {
      default: [
        {
          id: "metal.polished_nickel",
          label: "Polished nickel",
          assetRefs: [
            { assetId: "asset.metal.polished_nickel.01", fileName: "metal_polished_nickel_01.jpg", location: "repo", kind: "swatch" },
          ],
        },
        {
          id: "metal.brass_unlacquered",
          label: "Brass (unlacquered)",
          assetRefs: [
            { assetId: "asset.metal.brass_unlacquered.01", fileName: "metal_brass_unlacquered_01.jpg", location: "repo", kind: "swatch" },
          ],
        },
        {
          id: "metal.brass_lacquered_gold",
          label: "Brass (lacquered gold)",
          assetRefs: [
            { assetId: "asset.metal.brass_lacquered_gold.01", fileName: "metal_brass_lacquered_gold_01.jpg", location: "repo", kind: "swatch" },
          ],
        },
        {
          id: "metal.french_gold",
          label: "French gold",
          assetRefs: [
            { assetId: "asset.metal.french_gold.01", fileName: "metal_french_gold_01.jpg", location: "repo", kind: "swatch" },
          ],
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────────
  // TEXTILE ACCENT (worn leather removed; fringe replaced)
  // ────────────────────────────────────────────────────────────
  {
    category: "Textile Accent",
    content: {
      Parisian: "Velvet, 2) dark leather",
      Provincial: "Linen,striped linengrain sack; rustic weave, 2) warn leather",
      Mediterranean: "Ivory 2) striped linen with tassels/fringe",
    },
    rules: [
      { status: "allowed", note: "removable textiles" },
      { status: "required", note: "Mood palette: primary carrier" },
    ],
    candidates: {
      byArchetype: {
        Parisian: [
          {
            id: "textile.velvet",
            label: "Velvet",
            assetRefs: [
              { assetId: "asset.textile.velvet.01", fileName: "textile_velvet_01.jpg", location: "repo", kind: "texture" },
            ],
          },
          {
            id: "textile.dark_leather",
            label: "Dark leather",
            assetRefs: [
              { assetId: "asset.textile.dark_leather.01", fileName: "textile_dark_leather_01.jpg", location: "repo", kind: "texture" },
            ],
          },
        ],
        Provincial: [
          {
            id: "textile.linen",
            label: "Linen",
            assetRefs: [
              { assetId: "asset.textile.linen.01", fileName: "textile_linen_01.jpg", location: "repo", kind: "texture" },
            ],
          },
          {
            id: "textile.striped_linen_grain_sack",
            label: "Striped linen grain sack",
            assetRefs: [
              { assetId: "asset.textile.striped_linen_grain_sack.01", fileName: "textile_striped_linen_grain_sack_01.jpg", location: "repo", kind: "texture" },
            ],
          },
          {
            id: "textile.rustic_weave",
            label: "Rustic weave",
            assetRefs: [
              { assetId: "asset.textile.rustic_weave.01", fileName: "textile_rustic_weave_01.jpg", location: "repo", kind: "texture" },
            ],
          },
        ],
        Mediterranean: [
          {
            id: "textile.ivory",
            label: "Ivory",
            assetRefs: [
              { assetId: "asset.textile.ivory.01", fileName: "textile_ivory_01.jpg", location: "repo", kind: "texture" },
            ],
          },
          {
            id: "textile.striped_linen",
            label: "Striped linen",
            assetRefs: [
              { assetId: "asset.textile.striped_linen.01", fileName: "textile_striped_linen_01.jpg", location: "repo", kind: "texture" },
            ],
          },
        ],
      },
    },
  },

  // ────────────────────────────────────────────────────────────
  // WOOD ACCENT
  // ────────────────────────────────────────────────────────────
  {
    category: "Wood Accent",
    candidates: {
      default: [
        {
          id: "accent_wood.rift_oak",
          label: "Rift oak",
          assetRefs: [
            { assetId: "asset.accent_wood.rift_oak.01", fileName: "accent_wood_rift_oak_01.jpg", location: "repo", kind: "swatch" },
          ],
        },
        {
          id: "accent_wood.walnut",
          label: "Walnut",
          assetRefs: [
            { assetId: "asset.accent_wood.walnut.01", fileName: "accent_wood_walnut_01.jpg", location: "repo", kind: "swatch" },
          ],
        },
        {
          id: "accent_wood.white_oak_natural",
          label: "White oak (natural)",
          assetRefs: [
            { assetId: "asset.accent_wood.white_oak_natural.01", fileName: "accent_wood_white_oak_natural_01.jpg", location: "repo", kind: "swatch" },
          ],
        },
      ],
    },
  },
] as const;
