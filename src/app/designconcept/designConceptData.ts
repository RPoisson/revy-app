// src/app/designconcept/designConceptData.ts
// Placeholder data for the Design Concept Detail. Eventually populated by:
// Intake Agent (scope, budget, style), Creative Director (aesthetics), Project Manager (fiscal/scope).

import type { ArchetypeId } from "@/app/style/styleDNA";
import { STYLE_DNA } from "@/app/style/styleDNA";
import type { SlotId } from "@/app/style/style_render_map";

export type MoodboardAspectRatio = "1:1" | "1.5:1" | "3:4";

export type NarrativeBlock = {
  title: string;
  body: string;
};

export type ExecutiveSummary = {
  /** Investment capacity label (from budget heuristics / Intake) */
  investmentRangeLabel: string;
  /** Fiscal reasoning for high/low choices (Project Manager) */
  strategicTradeoffs: string[];
  /** StyleDNA title e.g. "Tonal Curated Textured Provincial" */
  styleDNATitle: string;
  /** Narrative blocks for 2x2 grid (Lovable-style). Built from above + optional 4th. */
  blocks: NarrativeBlock[];
};

export type MoodboardImage = {
  src: string;
  aspectRatio: MoodboardAspectRatio;
  conceptLabel?: string;
};

export type MaterialDecisionRow = {
  slotId: SlotId;
  slotTitle: string;
  thumbnailUrl: string;
  description: string;
  /** Style logic (Creative Director) */
  styleReasoning: string;
  /**
   * Scope column in Decision Details table. Studio Coordinator should set this from the
   * PM agent's auditedMaterials[].scopeReasoning (human-readable only; no rule IDs).
   */
  functionalReasoning: string;
};

export type DesignConceptDetail = {
  executiveSummary: ExecutiveSummary;
  moodboard: {
    conceptLabel: string;
    paletteStripColors: string[];
    images: MoodboardImage[];
  };
  materials: MaterialDecisionRow[];
};

const SLOT_TITLES: Record<SlotId, string> = {
  tile_floor: "Floor tile",
  tile_wall: "Wall tile",
  tile_shower: "Shower tile",
  lighting: "Lighting",
  vanity: "Vanity",
  countertop: "Countertop",
  hardware: "Hardware",
  architecture: "Architecture",
  ceiling: "Ceiling",
};

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23f8f5ee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2311111120" font-family="sans-serif" font-size="12">Preview</text></svg>'
  );

/**
 * Build placeholder Design Concept Detail from archetype.
 * Mirrors data that will later come from LangGraph (Intake + Creative Director + Project Manager).
 */
export function buildPlaceholderDesignConcept(
  archetype: ArchetypeId,
  investmentRangeLabel: string = "$200k–$350k"
): DesignConceptDetail {
  const dna = STYLE_DNA[archetype];
  const palette = [
    ...dna.palette.neutrals.slice(0, 2),
    ...dna.palette.core.slice(0, 1),
    ...dna.palette.accents.slice(0, 1),
  ];
  // Hex placeholders for palette strip (FCH-appropriate neutrals + accent)
  const hexByArchetype: Record<ArchetypeId, string[]> = {
    provincial: ["#e8e4dc", "#d4cfc4", "#7d9aa8", "#b8860b"],
    parisian: ["#f5f0e8", "#d4d0c8", "#2c2c2c", "#c9a227"],
    mediterranean: ["#faf6f0", "#e8dcc8", "#6b8e6b", "#4682b4"],
  };
  const paletteStripColors = hexByArchetype[archetype] ?? hexByArchetype.provincial;

  const styleDNATitle = [
    "Tonal",
    "Curated",
    dna.label,
  ].join(" ");

  const materials: MaterialDecisionRow[] = (
    [
      "tile_floor",
      "tile_wall",
      "countertop",
      "vanity",
      "hardware",
      "lighting",
    ] as SlotId[]
  ).map((slotId) => {
    const spec =
      slotId === "tile_floor"
        ? dna.flooringIntent?.[0]
        : slotId === "tile_wall"
          ? dna.stoneWallFinishIntent?.[0]
          : slotId === "countertop"
            ? dna.countertopIntent?.[0]
            : "Spec TBD";
    return {
      slotId,
      slotTitle: SLOT_TITLES[slotId],
      thumbnailUrl: PLACEHOLDER_IMG,
      description: `${spec ?? "Material"} — placeholder for retrieval output.`,
      styleReasoning: dna.signatureNotes?.slice(0, 2).join("; ") ?? "Aligns with archetype intent.",
      functionalReasoning: "Within scope and investment range; suitable for selected finish level.",
    };
  });

  const strategicTradeoffs = [
    "Prioritizing key wet rooms and shared spaces within the selected range.",
    "Finish level aligned to investment capacity to avoid over- or under-spec.",
  ];
  const blocks: NarrativeBlock[] = [
    {
      title: "Targeting Your Investment Range",
      body: `Every selection has been curated to align with ${investmentRangeLabel}. We've balanced premium focal-point pieces with cost-effective supporting elements so the overall investment stays within range without sacrificing design intent.`,
    },
    {
      title: "Strategic Trade-offs",
      body: strategicTradeoffs.join(" ") + " Where budget required compromise, we prioritized durability in high-traffic areas and visual impact in primary sight-lines.",
    },
    {
      title: "Matches Your Unique Style",
      body: `Your StyleDNA: ${styleDNATitle}. ${dna.essence} Each product was chosen to reinforce this balance—spaces that feel both curated and lived-in.`,
    },
    {
      title: "Intentional Selections",
      body: "Nothing here is arbitrary. Each material, fixture, and finish was selected for a specific reason—whether style logic from the Creative Director or scope and budget fit from the Project Manager.",
    },
  ];

  return {
    executiveSummary: {
      investmentRangeLabel,
      strategicTradeoffs,
      styleDNATitle,
      blocks,
    },
    moodboard: {
      conceptLabel: `${dna.label} — ${dna.settingVibe}`,
      paletteStripColors,
      images: [
        { src: PLACEHOLDER_IMG, aspectRatio: "1.5:1", conceptLabel: "Overview" },
        { src: PLACEHOLDER_IMG, aspectRatio: "1:1", conceptLabel: "Floor" },
        { src: PLACEHOLDER_IMG, aspectRatio: "3:4", conceptLabel: "Wall" },
      ],
    },
    materials,
  };
}
