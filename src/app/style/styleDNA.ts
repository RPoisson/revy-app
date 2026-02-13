// src/app/style/styleDNA.ts

export type ArchetypeId = "parisian" | "provincial" | "mediterranean";

export type AxisId = "rustic_refined" | "minimal_maximal" | "organic_structured";

export type SliderHints = Record<AxisId, number>;

export type StyleDNA = {
  id: ArchetypeId;
  label: string;
  tags: string[];

  // High-level identity used for UX + planning
  settingVibe: string;
  essence: string;
  signatureNotes: string[];

  // Palette + temperature logic is "intent", not strict enforcement
  palette: {
    core: string[];
    accents: string[];
    neutrals: string[];
    contrastNotes?: string[];
  };
  colorTemperatureLogic: string;

  // High-level material intent (not per-slot enforcement)
  countertopIntent: string[];
  stoneWallFinishIntent: string[];
  flooringIntent: string[];

  // Architecture intent (planner/renderer can use to set emphasis)
  architectureIntent: {
    ceilingTreatment: string[];
    linesGeometry: string[];
    doorWindowStyle: string[];
  };

  // Default axis positions for this archetype
  sliderHintsDefault: SliderHints;

  // Optional: identity tokens (used by retrieval/prompt headers; unweighted here)
  tokens: string[];
};

export const STYLE_DNA: Record<ArchetypeId, StyleDNA> = {
  provincial: {
    id: "provincial",
    label: "Provincial",
    tags: ["Provincial"],
    settingVibe: "Countryside warmth, grounded simplicity",
    essence: "Tactile, timeless, relaxed luxury; artisanal warmth; rustic charm.",
    signatureNotes: [
      "Patina",
      "Hand-applied plaster",
      "Visible joinery",
      "Artisanal craft",
      "Grounded proportions",
    ],
    palette: {
      neutrals: ["putty", "linen white", "soft greys", "warm creams"],
      core: ["earthy tones", "natural blues"],
      accents: ["muted blue", "aged brass", "blackened iron"],
      contrastNotes: ["Warm neutrals paired with cool stone; low-to-medium contrast."],
    },
    colorTemperatureLogic: "Warm neutrals + cool stone",
    countertopIntent: ["honed marble", "limestone", "patina-friendly stone", "wood tops"],
    stoneWallFinishIntent: [
      "random/irregular limestone stack",
      "rough face stone",
      "over/dry grout",
      "zellige accent wall (muted)",
    ],
    flooringIntent: [
      "reclaimed Belgian terracotta",
      "bush-hammered limestone",
      "small hex tile (subtle)",
    ],
    architectureIntent: {
      ceilingTreatment: ["exposed beams (oak/whitewashed)", "gentle plaster curves"],
      linesGeometry: ["soft curves", "rustic joinery", "heavier proportions"],
      doorWindowStyle: ["linen café curtains", "wood shutters", "arched openings", "cremone bolts"],
    },
    sliderHintsDefault: {
      rustic_refined: 0.3,
      minimal_maximal: 0.4,
      organic_structured: 0.6,
    },
    tokens: [
      "heritage_farmhouse",
      "earned_patina",
      "enduring_craftsmanship",
      "grounded_materials",
      "functional",
      "quiet_craft",
      "practical_forms",
      "thick_profiles",
      "visible_grout",
    ],
  },

  parisian: {
    id: "parisian",
    label: "Parisian",
    tags: ["Parisian"],
    settingVibe: "Urban elegance, architectural heritage",
    essence: "Structured, refined, editorial poise; sophisticated restraint.",
    signatureNotes: [
      "Symmetry",
      "Gleam",
      "Haussmann proportions",
      "Heritage detailing",
      "Tailored composition",
    ],
    palette: {
      neutrals: ["cream", "warm neutrals", "dove grey"],
      core: ["black/navy contrast", "refined stone whites"],
      accents: ["polished brass", "polished nickel", "controlled blackened metal"],
      contrastNotes: ["Warm creams with cool black/navy accents; crisp tonal separation."],
    },
    colorTemperatureLogic: "Warm creams + cool black/navy accents",
    countertopIntent: ["polished/honed marble", "thin profile stone", "refined limestone", "wood (controlled)"],
    stoneWallFinishIntent: ["bush-hammered limestone", "50% overlay", "smooth plaster"],
    flooringIntent: [
      "marble checkerboard",
      "penny round",
      "cross-weave / basketweave",
      "lapidary oval (accent logic)",
    ],
    architectureIntent: {
      ceilingTreatment: ["coffered ceilings", "crown molding", "paneled ceilings"],
      linesGeometry: ["strong vertical lines", "symmetry", "slender proportions"],
      doorWindowStyle: ["tall paneled double doors", "floor drapery", "brass/black cremone"],
    },
    sliderHintsDefault: {
      rustic_refined: 0.9,
      minimal_maximal: 0.6,
      organic_structured: 0.3,
    },
    tokens: [
      "urban_elegance",
      "tailored",
      "formal",
      "refined_materials",
      "architectural",
      "symmetry",
      "classic",
      "art_deco_lineage",
    ],
  },

  mediterranean: {
    id: "mediterranean",
    label: "Mediterranean",
    tags: ["Mediterranean"],
    settingVibe: "Coastal breeziness, bohemian leisure",
    essence: "Vibrant, sun-washed, layered ease; effortless imperfection.",
    signatureNotes: [
      "Color + texture",
      "Breeze / indoor-outdoor",
      "Organic rhythm",
      "Sunwashed imperfection",
      "Handmade surfaces",
    ],
    palette: {
      neutrals: ["white", "sand", "warm cream"],
      core: ["terracotta", "olive", "sea green"],
      accents: ["turquoise", "French blue"],
      contrastNotes: ["Warm terracotta paired with cool turquoise/olive; medium contrast allowed."],
    },
    colorTemperatureLogic: "Warm terracotta + cool turquoise/olive pairing",
    countertopIntent: [
      "honed marble",
      "creamy limestone",
      "travertine",
      "chiseled edges",
    ],
    stoneWallFinishIntent: [
      "irregular stone stack",
      "rough face stone",
      "over/dry grout",
      "colored zellige wall",
    ],
    flooringIntent: ["terracotta", "mosaic Cle tile", "patterned cement (accent zones)"],
    architectureIntent: {
      ceilingTreatment: ["white plaster", "wood slats", "woven reed", "soft stucco vaults"],
      linesGeometry: ["rounded corners", "organic arcs", "soft-cube geometry"],
      doorWindowStyle: ["painted shutters (blue/olive)", "gauzy sheers", "arched frames", "iron grilles"],
    },
    sliderHintsDefault: {
      rustic_refined: 0.5,
      minimal_maximal: 0.8,
      organic_structured: 0.7,
    },
    tokens: [
      "informal_coastal_ease",
      "nature_inspired",
      "handcrafted_elements",
      "indoor_outdoor",
      "sun_washed_materials",
      "tile_variation",
      "plaster",
      "woven_elements",
    ],
  },
};
