// src/app/designconcept/designConceptData.ts
// Placeholder data for the Design Concept Detail. Eventually populated by:
// Intake Agent (scope, budget, style), Creative Director (aesthetics), Project Manager (fiscal/scope).

import type { ArchetypeId } from "@/app/style/styleDNA";
import { STYLE_DNA } from "@/app/style/styleDNA";
import type { SlotId } from "@/app/style/style_render_map";
import type { ProjectManagerSelectionOutput, SelectedProduct } from "@/app/agents/projectManagerAgent.types";

export type MoodboardAspectRatio = "1:1" | "1.5:1" | "3:4";

export type NarrativeBlock = {
  title: string;
  body: string;
};

export type ExecutiveSummary = {
  /** Investment capacity label (from budget heuristics / quiz intake) */
  investmentRangeLabel: string;
  /** High-level summary of scope and budget decisions (summarizes Decision Detail reasoning) */
  strategicTradeoffs: string[];
  /** StyleDNA title from user's style (quiz/intake), e.g. "Tonal Curated Textured Provincial" */
  styleDNATitle: string;
  /** Narrative blocks for 2x2 grid. Built from quiz/intake style and scope/budget summary. */
  blocks: NarrativeBlock[];
};

export type MoodboardImage = {
  src: string;
  aspectRatio: MoodboardAspectRatio;
  conceptLabel?: string;
};

export type MaterialDecisionRow = {
  slotId: SlotId;
  /** Room this selection belongs to (moodboard layout ID, e.g. "primary-bathroom"). Undefined for placeholder rows. */
  roomId?: string;
  slotTitle: string;
  thumbnailUrl: string;
  description: string;
  /** Style logic for this selection (from quiz/intake style; shown in Decision Detail) */
  styleReasoning: string;
  /**
   * Scope column in Decision Details table. Human-readable scope reasoning only; no rule IDs.
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

/** Slot keys from PM can be "slotId" or "slotId|roomId"; base slot id for display. */
function slotKeyToSlotId(slotKey: string): string {
  return slotKey.includes("|") ? slotKey.split("|")[0] : slotKey;
}

/**
 * Build Design Concept Detail from the CD → PM pipeline output.
 * Used when the user has clicked "Create Designs" and we have agent output in the store.
 * When summaryBlocks are provided (from LLM), they are used for the executive summary blocks.
 */
export function buildDesignConceptFromAgentOutput(
  pmOutput: ProjectManagerSelectionOutput,
  options: {
    archetype: ArchetypeId;
    investmentRangeLabel: string;
    /** LLM-generated blocks; when provided, used instead of template blocks */
    summaryBlocks?: NarrativeBlock[];
  }
): DesignConceptDetail {
  const { archetype, investmentRangeLabel, summaryBlocks: llmBlocks } = options;
  const dna = STYLE_DNA[archetype];

  const materialsResolved: MaterialDecisionRow[] = Object.entries(pmOutput.selectionsBySlot).map(
    ([slotKey, sel]) => {
      const [slotIdRaw, roomId] = slotKey.includes("|") ? slotKey.split("|") : [slotKey, undefined];
      const slotId = slotIdRaw as SlotId;
      return {
        slotId,
        roomId,
        slotTitle: SLOT_TITLES[slotId] ?? slotIdRaw.replace(/_/g, " "),
        thumbnailUrl: sel.product.image_url1 ?? PLACEHOLDER_IMG,
        description: sel.product.title ?? "",
        styleReasoning: sel.styleReasoning ?? "Aligns with style intent.",
        functionalReasoning: sel.scopeReasoning,
      };
    }
  );

  const hexByArchetype: Record<ArchetypeId, string[]> = {
    provincial: ["#e8e4dc", "#d4cfc4", "#7d9aa8", "#b8860b"],
    parisian: ["#f5f0e8", "#d4d0c8", "#2c2c2c", "#c9a227"],
    mediterranean: ["#faf6f0", "#e8dcc8", "#6b8e6b", "#4682b4"],
  };
  const paletteStripColors = hexByArchetype[archetype] ?? hexByArchetype.provincial;
  const styleDNATitle = ["Tonal", "Curated", dna.label].join(" ");
  const styleHighlights = dna.signatureNotes?.slice(0, 3).join(", ") ?? "";
  const strategicTradeoffsSummary =
    pmOutput.budgetStatus === "comfortable"
      ? `Selections fit comfortably within ${investmentRangeLabel}. Scope and finish level were applied consistently—the Decision Detail table below spells out the specific reasoning for each selection.`
      : pmOutput.budgetStatus === "tight"
        ? `Selections are aligned to ${investmentRangeLabel} with limited flexibility. Where trade-offs were needed, scope and durability were prioritized. See the Decision Detail table below for per-item reasoning.`
        : `Selections were made within your stated scope and budget parameters. The Decision Detail table below summarizes the style and scope logic behind each choice.`;

  const blocks: NarrativeBlock[] =
    llmBlocks && llmBlocks.length >= 4
      ? llmBlocks
      : [
          {
            title: "Targeting Your Investment Range",
            body: `Every selection has been curated to align with ${investmentRangeLabel}. Budget status: ${pmOutput.budgetStatus}. We've balanced focal-point pieces with cost-effective elements so the overall investment stays within range.`,
          },
          {
            title: "Strategic Trade-offs",
            body: strategicTradeoffsSummary,
          },
          {
            title: "Matches Your Unique Style",
            body: `Your StyleDNA: ${styleDNATitle}. ${dna.essence}${styleHighlights ? ` Key themes: ${styleHighlights}.` : ""} Each product was chosen to reinforce this—spaces that feel ${dna.settingVibe}.`,
          },
          {
            title: "Intentional Selections",
            body: "Nothing here is arbitrary. Each material, fixture, and finish was selected for a specific reason—driven by the style and scope logic of your project. The Decision Detail table below outlines the reasoning for every selection.",
          },
        ];

  return {
    executiveSummary: {
      investmentRangeLabel,
      strategicTradeoffs: [strategicTradeoffsSummary],
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
    materials: materialsResolved,
  };
}

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

  const styleHighlights = dna.signatureNotes?.slice(0, 3).join(", ") ?? "";
  const blocks: NarrativeBlock[] = [
    {
      title: "Targeting Your Investment Range",
      body: `Every selection has been curated to align with ${investmentRangeLabel}. We've balanced premium focal-point pieces with cost-effective supporting elements so the overall investment stays within range without sacrificing design intent.`,
    },
    {
      title: "Strategic Trade-offs",
      body: "Selections are aligned to your scope and investment range. Where trade-offs were needed, durability and finish level were prioritized. The Decision Detail table below outlines the specific reasoning for each selection.",
    },
    {
      title: "Matches Your Unique Style",
      body: `Your StyleDNA: ${styleDNATitle}. ${dna.essence}${styleHighlights ? ` Key themes: ${styleHighlights}.` : ""} Each product was chosen to reinforce this—spaces that feel ${dna.settingVibe}.`,
    },
    {
      title: "Intentional Selections",
      body: "Nothing here is arbitrary. Each material, fixture, and finish was selected for a specific reason—driven by the style and scope logic of your project. The Decision Detail table below outlines the reasoning for every selection.",
    },
  ];

  const placeholderStrategicSummary =
    "Selections are aligned to your scope and investment range. The Decision Detail table below outlines the specific reasoning for each selection.";

  return {
    executiveSummary: {
      investmentRangeLabel,
      strategicTradeoffs: [placeholderStrategicSummary],
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
