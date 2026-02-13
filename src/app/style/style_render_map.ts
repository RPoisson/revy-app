// src/app/style/style_render_map.ts

import type { ArchetypeId } from "./styleDNA";

export type Weight = 3 | 2 | 1 | -1;

export type SlotId =
  | "tile_floor"
  | "tile_wall"
  | "tile_shower"
  | "lighting"
  | "vanity"
  | "countertop"
  | "hardware"
  | "architecture"
  | "ceiling";

export type WeightedTerm = {
  term: string;
  weight: Weight;
  note?: string;
};

export type SlotRules = {
  slot: SlotId;

  // Weighted terms bias retrieval/ranking. Keep human-auditable.
  include: WeightedTerm[];

  // Soft avoid: allowed but should lose tie-breakers.
  avoidLite?: string[];

  // Hard rules are flags your planner/critic can enforce deterministically.
  hardRules?: string[];

  // Optional: if you want to pin hero behavior later (planner decides)
  heroTerms?: string[];
};

export type ArchetypeRenderMap = {
  archetype: ArchetypeId;

  // Short prompt header fragments (used by renderer/explainer). Not for exposure/photography.
  promptHeader: string[];

  // Slot-level rules
  slots: Record<SlotId, SlotRules>;
};

const W = (term: string, weight: Weight, note?: string): WeightedTerm => ({ term, weight, note });

export const STYLE_RENDER_MAP: Record<ArchetypeId, ArchetypeRenderMap> = {
  parisian: {
    archetype: "parisian",
    promptHeader: [
      "urban elegance",
      "architectural heritage",
      "tailored composition",
      "symmetry",
      "refined materials",
    ],
    slots: {
      tile_floor: {
        slot: "tile_floor",
        include: [
          W("marble basketweave", 3, "HERO"),
          W("marble herringbone", 3, "HERO"),
          W("checkerboard marble", 3, "HERO"),
          W("penny round with dot or floral motifs + border", 3, "HERO tile-rug"),
          W("marble mosaics", 2),
          W("stone inlays", 2),
          W("honed marble", 2),
          W("polished marble", 2),
          W("tight grout", 1),
          W("crisp alignment", 1),
          W("directional rhythm", 1),
          W("small to medium scale", 1),
          W("radial / fan / geometric mosaic (accent)", 2, "HERO–ACCENT"),
          W("decorative inset rug mosaic (accent)", 2, "HERO–ACCENT"),
        ],
        avoidLite: ["visible grout emphasis", "high variation", "handmade irregular"],
        hardRules: [
          "precision > variation",
          "borders/symmetry/alignment encouraged",
          "decorative mosaic panels are accent-only (never full-room)",
          "grout lines minimized",
        ],
        heroTerms: [
          "marble basketweave",
          "marble herringbone",
          "checkerboard marble",
          "penny round with dot or floral motifs + border",
        ],
      },

      tile_wall: {
        slot: "tile_wall",
        include: [
          W("subway tile (refined)", 2),
          W("zellige in controlled grid", 1),
          W("dark grout subway (controlled contrast)", 1),
          W("bordered compositions", 2),
          W("inset panel / framed tile", 2),
        ],
        avoidLite: ["highly irregular edges", "overly rustic texture"],
        hardRules: ["composition feels architectural and tailored"],
      },

      tile_shower: {
        slot: "tile_shower",
        include: [
          W("plaster walls", 2),
          W("large format subway honed marble", 2),
          W("herringbone honed marble", 2),
          W("subway with high contrast grout (Parisian)", 1),
        ],
        avoidLite: ["handmade irregular hero in shower"],
      },

      lighting: {
        slot: "lighting",
        include: [
          W("milk glass / opaline sconces", 3, "HERO"),
          W("fluted glass sconces", 3, "HERO"),
          W("alabaster sconces", 2),
          W("deco-inspired globes / stepped forms", 3, "HERO"),
          W("paired wall sconces (symmetry)", 3, "HERO"),
          W("picture lights", 2),
          W("slim linear accents", 2),
          W("polished brass", 1),
          W("polished nickel", 1),
          W("controlled blackened metal", 1, "rare, controlled"),
          W("2750–3000K", 1),
          W("avoid overly warm/amber", -1),
          W("avoid exposed bulbs unless intentional deco", -1),
        ],
        hardRules: [
          "symmetry required for hero lighting",
          "shades/globes feel architectural, not soft",
        ],
        heroTerms: [
          "milk glass / opaline sconces",
          "fluted glass sconces",
          "deco-inspired globes / stepped forms",
          "paired wall sconces (symmetry)",
        ],
      },

      vanity: {
        slot: "vanity",
        include: [
          W("furniture-style vanity", 3, "HERO"),
          W("fluted fronts", 3, "HERO"),
          W("inset panels", 3, "HERO"),
          W("integrated marble top", 3),
          W("slab backsplash", 2),
          W("slim profiles", 2),
          W("elevated off floor", 2),
          W("refined toe-kick", 2),
          W("brass hardware (visible)", 2),
          W("nickel hardware (visible)", 2),
          W("painted wood (soft white/greige/muted)", 1),
          W("symmetry preferred (double sinks, paired mirrors)", 1),
          W("avoid shaker-only boxes", -1),
          W("avoid flat slab fronts", -1),
          W("avoid integrated finger pulls", -1),
        ],
        hardRules: [
          "vanity reads as furniture/millwork, not builder cabinetry",
          "legs or toe-kick must feel refined",
          "hardware is visible and intentional",
        ],
      },

      countertop: {
        slot: "countertop",
        include: [
          W("polished marble", 2),
          W("honed marble", 2),
          W("thin profile stone", 2),
          W("thin pencil edge / crisp edge", 2),
          W("refined limestone", 1),
        ],
        avoidLite: ["chiseled edge", "thick rustic edge"],
      },

      hardware: {
        slot: "hardware",
        include: [
          W("polished brass", 2),
          W("polished nickel", 2),
          W("fluted or beveled forms", 2),
          W("controlled blackened metal", 1),
        ],
        avoidLite: ["raw/blackened rustic pulls", "hammered rustic hardware"],
      },

      architecture: {
        slot: "architecture",
        include: [
          W("wall molding / paneling", 2),
          W("Haussmann proportions", 2),
          W("beveled mirror", 2),
          W("tall paneled doors", 1),
          W("strong vertical lines", 2),
          W("symmetry", 2),
        ],
        avoidLite: ["shiplap", "farmhouse cues", "rope/nautical"],
      },

      ceiling: {
        slot: "ceiling",
        include: [
          W("coffered ceilings", 2),
          W("crown molding", 2),
          W("paneled ceilings", 1),
        ],
      },
    },
  },

  provincial: {
    archetype: "provincial",
    promptHeader: [
      "countryside warmth",
      "grounded simplicity",
      "quiet craft",
      "earned patina",
      "functional beauty",
    ],
    slots: {
      tile_floor: {
        slot: "tile_floor",
        include: [
          W("terracotta herringbone (raw/antique)", 3, "HERO"),
          W("octagon + dot stone", 3, "HERO"),
          W("straight-laid limestone", 3, "HERO"),
          W("antique hex (irregular edges)", 3, "HERO"),
          W("soft checkerboard stone (muted)", 2),
          W("bush-hammered limestone", 2),
          W("reclaimed Belgian terracotta", 2),
          W("warm grout", 1),
          W("visible joints", 1),
          W("finish/patina > geometry", 2),
          W("avoid tight precision", -1),
          W("avoid high contrast / graphic", -1),
        ],
        hardRules: [
          "grout is visible and warm-toned",
          "layouts feel expected, never decorative",
          "patina and surface character are prioritized",
        ],
        heroTerms: [
          "terracotta herringbone (raw/antique)",
          "octagon + dot stone",
          "straight-laid limestone",
          "antique hex (irregular edges)",
        ],
      },

      tile_wall: {
        slot: "tile_wall",
        include: [
          W("zellige in muted simple grid", 2),
          W("brick/offset layouts with visible grout", 2),
          W("subway tile (low contrast grout)", 1),
          W("plaster walls", 2),
        ],
        avoidLite: ["high gloss", "tight crisp modern alignment"],
      },

      tile_shower: {
        slot: "tile_shower",
        include: [
          W("plaster walls", 2),
          W("subway tile with low contrast grout", 2),
          W("herringbone honed marble", 2),
        ],
      },

      lighting: {
        slot: "lighting",
        include: [
          W("disk pendants", 3, "HERO"),
          W("simple cone or dome pendants", 3, "HERO"),
          W("torch-style wall lights", 3, "HERO"),
          W("candle-inspired sconces", 3, "HERO"),
          W("simple lantern forms", 2),
          W("aged brass", 2),
          W("blackened or oil-rubbed iron", 2),
          W("patinated metals", 2),
          W("ceramic bases (restrained)", 1),
          W("visible mounting/hardware ok", 1),
          W("warm light preferred", 1),
        ],
        hardRules: ["lighting feels useful first", "slight irregularity acceptable"],
      },

      vanity: {
        slot: "vanity",
        include: [
          W("inset or shaker doors", 3, "HERO"),
          W("tongue-and-groove", 3, "HERO"),
          W("chunkier proportions", 3, "HERO"),
          W("painted wood (cream/soft gray/muted blue)", 2),
          W("natural wood (oak)", 2),
          W("honed marble top", 2),
          W("limestone top", 2),
          W("grounded stance (legs or plinth)", 2),
          W("simple tactile hardware", 1),
          W("visible joinery acceptable", 1),
          W("avoid floating boxes", -1),
          W("avoid high gloss finishes", -1),
        ],
        hardRules: ["built, solid, enduring (worktable energy)"],
      },

      countertop: {
        slot: "countertop",
        include: [
          W("honed marble", 2),
          W("limestone", 2),
          W("thicker profile", 1),
          W("eased edge / softened edge", 1),
        ],
        avoidLite: ["thin pencil edge", "high polish"],
      },

      hardware: {
        slot: "hardware",
        include: [
          W("aged brass", 2),
          W("iron hardware", 2),
          W("raw/blackened metal", 2),
          W("simple tactile pulls", 1),
        ],
      },

      architecture: {
        slot: "architecture",
        include: [
          W("exposed beams", 2),
          W("visible joinery", 2),
          W("arched openings", 1),
          W("wood shutters", 1),
        ],
      },

      ceiling: {
        slot: "ceiling",
        include: [W("exposed beams (oak/whitewashed)", 2), W("gentle plaster curves", 1)],
      },
    },
  },

  mediterranean: {
    archetype: "mediterranean",
    promptHeader: [
      "coastal breeziness",
      "sun-washed materials",
      "handmade surfaces",
      "organic rhythm",
      "indoor-outdoor ease",
    ],
    slots: {
      tile_floor: {
        slot: "tile_floor",
        include: [
          W("zellige square grid", 3, "HERO"),
          W("basketweave glazed ceramic (block/stack)", 3, "HERO"),
          W("small-scale artisanal mosaic", 3, "HERO"),
          W("brick / running bond glazed tile", 3, "HERO"),
          W("terracotta flooring", 2),
          W("patterned cement (accent zones)", 2, "HERO–ACCENT"),
          W("irregular stone set loosely", 2),
          W("glaze variation required", 2),
          W("grout as texture", 1),
          W("avoid borders (rare)", -1),
          W("avoid sharp geometry / formal contrast", -1),
        ],
        hardRules: [
          "variation is mandatory",
          "borders are rare",
          "grout is part of the texture",
        ],
        heroTerms: [
          "zellige square grid",
          "basketweave glazed ceramic (block/stack)",
          "small-scale artisanal mosaic",
          "brick / running bond glazed tile",
        ],
      },

      tile_wall: {
        slot: "tile_wall",
        include: [
          W("tadelakt", 3),
          W("lime plaster / hand-troweled plaster", 3),
          W("colored zellige walls", 2),
          W("curved plaster forms", 2),
          W("over/dry grout (stone)", 2),
        ],
        avoidLite: ["crisp framed borders", "high precision alignment as a primary cue"],
      },

      tile_shower: {
        slot: "tile_shower",
        include: [
          W("zellige walls", 3),
          W("plaster", 2),
          W("penny tile floor", 2),
          W("small mosaic floor", 2),
        ],
      },

      lighting: {
        slot: "lighting",
        include: [
          W("plaster sconces", 3, "HERO"),
          W("ceramic sconces", 3, "HERO"),
          W("lanterns (clay/alabaster)", 3, "HERO"),
          W("woven pendants", 2),
          W("hidden/indirect lighting", 2),
          W("diffused light", 2),
          W("2400–2700K", 1),
          W("hammered brass (low shine)", 1),
          W("matte iron", 1),
          W("avoid shiny metals", -1),
          W("avoid graphic fixtures", -1),
          W("avoid precision-focused lighting", -1),
        ],
        hardRules: [
          "light supports texture, not geometry",
          "asymmetry acceptable",
        ],
      },

      vanity: {
        slot: "vanity",
        include: [
          W("masonry or plaster base", 3, "HERO"),
          W("tiled vanity", 3, "HERO"),
          W("monolithic concrete/stone forms", 3, "HERO"),
          W("creamy limestone", 2),
          W("travertine", 2),
          W("chiseled/irregular edges", 2),
          W("vessel sink", 2),
          W("open shelving", 2),
          W("whitewashed wood fronts", 2),
          W("curved raised backsplash", 1),
          W("avoid furniture-style legs", -1),
          W("avoid polished stone", -1),
          W("avoid highly articulated millwork", -1),
        ],
        hardRules: ["imperfection acceptable", "can feel built-in and architectural"],
      },

      countertop: {
        slot: "countertop",
        include: [
          W("honed marble", 2),
          W("creamy limestone", 2),
          W("travertine", 2),
          W("chiseled edge / organic thickness", 2),
        ],
        avoidLite: ["thin pencil edge", "high polish"],
      },

      hardware: {
        slot: "hardware",
        include: [
          W("hammered brass", 2),
          W("matte iron", 2),
          W("painted ceramic pulls", 2),
          W("handmade look", 1),
        ],
      },

      architecture: {
        slot: "architecture",
        include: [
          W("rounded corners", 2),
          W("organic arcs", 2),
          W("soft stucco vaults", 2),
          W("painted shutters (blue/olive)", 1),
          W("iron grilles", 1),
        ],
      },

      ceiling: {
        slot: "ceiling",
        include: [
          W("white plaster", 2),
          W("wood slats", 2),
          W("woven reed", 2),
          W("soft stucco vaults", 2),
        ],
      },
    },
  },
};
