// src/app/resultText.ts
import type { StyleResult, Answers } from "./scoring";
import type { Archetype } from "./styleWeights";

type LightKey = "bright" | "moody";
type CompositionKey = "minimal" | "maximal";
type MaterialKey = "modern" | "rustic";

type StyleClusterKey = `${Archetype}_${LightKey}_${CompositionKey}_${MaterialKey}`;

interface StyleCluster {
  name: string;
  description: string;
}

export interface RoomDesignSummary {
  primaryUserLabel?: string;
  vanityLabel?: string;
  bathingLabel?: string;
  // Optional combined string if you ever want it:
  summarySentence?: string;
}

// Final shape the UI will use
export interface GeneratedResultText {
  // Section: Room Design
  roomDesign: RoomDesignSummary;

  // Section: Style
  title: string;        // e.g. "Lived-In Dramatic Provincial"
  styleName: string;    // same as title, but kept for flexibility
  description: string;  // single blended paragraph

  // Extra meta if you ever need it
  primaryLabel: string;
  secondaryLabel?: string;
}

// Human-friendly labels for archetypes
const ARCHETYPE_LABELS: Record<Archetype, string> = {
  parisian: "Parisian",
  mediterranean: "Mediterranean",
  provincial: "Provincial",
};

// Core anchors per archetype
const CORE_STYLE_SUMMARY: Record<Archetype, string> = {
  parisian:
    "At the core, your taste pulls toward Parisian elegance—architectural details, refined symmetry, and a curated, editorial sense of restraint.",
  mediterranean:
    "At the core, your taste leans Mediterranean—natural materials, sun-washed light, and an easy, lived-in sense of coastal calm.",
  provincial:
    "At the core, your taste is Provincial—grounded, tactile, and cozy, with a love for rustic charm, handmade details, and humble luxury.",
};

// Blend descriptions when there’s a strong secondary archetype
const BLEND_LINES: Record<string, string> = {
  "parisian-provincial":
    "There’s a quiet pull between city poise and countryside warmth, which opens the door for both tailored detailing and tactile, rustic elements.",
  "parisian-mediterranean":
    "You sit between structured city refinement and relaxed coastal ease, which invites clean silhouettes softened by organic textures and light.",
  "provincial-mediterranean":
    "You’re drawn to grounded, countryside comfort with a coastal breeze layered over it—rooted but never heavy, warm but still airy.",
};

function getBlendLine(primary: Archetype, secondary?: Archetype): string | null {
  if (!secondary) return null;
  const directKey = `${primary}-${secondary}`;
  const reverseKey = `${secondary}-${primary}`;
  return BLEND_LINES[directKey] ?? BLEND_LINES[reverseKey] ?? null;
}

// Map numeric axes → discrete buckets for naming only
function lightKeyFromValue(v: number): LightKey {
  return v < 0.5 ? "bright" : "moody";
}
function compositionKeyFromValue(v: number): CompositionKey {
  return v < 0.5 ? "minimal" : "maximal";
}
function materialKeyFromValue(v: number): MaterialKey {
  return v < 0.5 ? "modern" : "rustic";
}

// Style naming grid (archetype + axes → title + base description)
const STYLE_CLUSTERS: Record<StyleClusterKey, StyleCluster> = {
  // ── PARISIAN ─────────────────────────────────────────────
  parisian_bright_minimal_modern: {
    name: "Refined Light-Filled Parisian",
    description:
      "A serene, gallery-like space with polished stone, soft plaster, and brushed metal accents. Neutral whites and creams bounce cool daylight for an elegant, uncluttered atmosphere.",
  },
  parisian_bright_minimal_rustic: {
    name: "Soft Light-Filled Parisian Rustic",
    description:
      "Sunlit plaster walls, pale oak floors, and simple linen furnishings keep this Parisian space feeling light and relaxed. Rustic touches—wood, cane, and handwoven textiles—are edited and quiet rather than busy.",
  },
  parisian_bright_maximal_modern: {
    name: "Collected Light-Filled Parisian",
    description:
      "A light-saturated Parisian interior layered with books, art, and vintage finds. Pops of color in textiles and artwork contrast against refined architectural lines and modern detailing.",
  },
  parisian_bright_maximal_rustic: {
    name: "Layered Light-Filled Parisian Rustic",
    description:
      "High ceilings and classic mouldings set the stage for vintage rugs, carved wood, and woven textures. Bright daylight softens the patina, making the room feel inviting rather than heavy.",
  },
  parisian_moody_minimal_modern: {
    name: "Refined Dramatic Parisian",
    description:
      "Deep charcoal and ivory tones meet sculptural silhouettes, creating a moody yet minimal space. Sleek materials—marble, glass, dark metal—are balanced with subtle symmetry and restraint.",
  },
  parisian_moody_minimal_rustic: {
    name: "Smoky Parisian Rustic",
    description:
      "Charcoal or mushroom limewash walls, simple oak furniture, and soft linen upholstery create an intimate, candlelit mood. Rustic details are pared back, so the texture feels intentional and calm.",
  },
  parisian_moody_maximal_modern: {
    name: "Layered Dramatic Parisian Modern",
    description:
      "Inky walls and rich neutrals frame bold art, statement lighting, and modern silhouettes. The effect is a dramatic Parisian salon—saturated, layered, and editorial without feeling cluttered.",
  },
  parisian_moody_maximal_rustic: {
    name: "Collected Dramatic Parisian",
    description:
      "A sensuous, expressive interior with inky walls, antique mirrors, and timeworn wood. Jewel tones, patina, and aged brass bring depth while preserving a distinctly Parisian poise.",
  },

  // ── MEDITERRANEAN ────────────────────────────────────────
  mediterranean_bright_minimal_modern: {
    name: "Refined Airy Mediterranean",
    description:
      "A tranquil coastal retreat with whitewashed plaster, pale stone, and crisp linen. Sand, ivory, and soft gray keep the palette neutral, while sunlight and clean lines make it feel effortlessly airy.",
  },
  mediterranean_bright_minimal_rustic: {
    name: "Soft Airy Mediterranean Rustic",
    description:
      "White or chalky plaster, hand-troweled walls, and pale terracotta or limestone floors define this relaxed look. A few rustic stools, benches, and woven pieces keep it grounded but still breezy and open.",
  },
  mediterranean_bright_maximal_modern: {
    name: "Layered Airy Mediterranean Modern",
    description:
      "A bright coastal shell with graphic tile, sculptural lighting, and clean-lined furnishings. Blue, sand, and sun-faded tones layer through textiles and art for a playful yet polished seaside energy.",
  },
  mediterranean_bright_maximal_rustic: {
    name: "Layered Airy Mediterranean",
    description:
      "Sun-soaked plaster walls, woven textures, and hand-thrown ceramics mix with sea-blue and terracotta tones. Organic imperfection and layered textiles give this space a vibrant, textured warmth.",
  },
  mediterranean_moody_minimal_modern: {
    name: "Refined Dramatic Mediterranean",
    description:
      "An earthy yet elevated mood—travertine, bronze, and deep clay hues under warm light. Clean-lined fixtures and sculptural stone keep things natural but imbued with quiet drama.",
  },
  mediterranean_moody_minimal_rustic: {
    name: "Earthy Dramatic Mediterranean Rustic",
    description:
      "Chalky clay walls, rough-hewn wood, and textured stone come together in a low, warm palette. The room feels like an evening retreat—simple, earthy, and softly lit.",
  },
  mediterranean_moody_maximal_modern: {
    name: "Glam Riviera Mediterranean",
    description:
      "Deeper sea-blues, olive, and umber tones wash over smooth plaster and stone. Curved, modern seating, metal accents, and generous textiles lend a glamorous, lounge-like coastal mood.",
  },
  mediterranean_moody_maximal_rustic: {
    name: "Layered Dramatic Mediterranean",
    description:
      "Clay walls and aged terracotta floors anchor a palette of ochre, indigo, and rust. Layered textiles, candles, and wood evoke the warmth of an old-world villa at dusk.",
  },

  // ── PROVINCIAL ───────────────────────────────────────────
  provincial_bright_minimal_modern: {
    name: "Refined Sunwashed Provincial",
    description:
      "A calm countryside-inspired space with pale wood, cream plaster, and simple lines. Sunlight filters through soft linen, highlighting a neutral palette with a gentle, refined ease.",
  },
  provincial_bright_minimal_rustic: {
    name: "Soft Sunwashed Provincial Rustic",
    description:
      "Whitewashed or warm plaster, exposed beams, and light oak or pine give a breezy farmhouse feel. A few woven baskets, pottery, and natural textiles keep it honest and unpretentious.",
  },
  provincial_bright_maximal_modern: {
    name: "Layered Sunwashed Provincial Modern",
    description:
      "A bright, rustic shell enlivened with modern lighting, tailored upholstery, and art. Color and pattern run through pillows, rugs, and textiles, while the architecture stays warm and humble.",
  },
  provincial_bright_maximal_rustic: {
    name: "Lived-In Sunwashed Provincial",
    description:
      "A golden, textural interior filled with patina and life—woven rugs, copper accents, and lavender-toned textiles. Warm terracotta, sage, and cream sit comfortably against rustic oak and stone.",
  },
  provincial_moody_minimal_modern: {
    name: "Refined Dramatic Provincial",
    description:
      "A quiet, atmospheric space with tailored woodwork, limestone, and soft shadows. Mushroom, taupe, and bone neutrals pair with clean detailing for a restrained, farmhouse-inspired elegance.",
  },
  provincial_moody_minimal_rustic: {
    name: "Earthy Dramatic Provincial Rustic",
    description:
      "Deeper olives, browns, and putty tones wrap around stone, reclaimed wood, and nubby linen. Furnishings are simple and sturdy, giving the room a grounded, cocoon-like feel.",
  },
  provincial_moody_maximal_modern: {
    name: "Layered Dramatic Provincial Modern",
    description:
      "Dark-painted cabinetry, stone, and black metal accents sit inside a farmhouse envelope. Layered textiles, statement lighting, and art bring a modern intensity to traditional bones.",
  },
  provincial_moody_maximal_rustic: {
    name: "Lived-In Dramatic Provincial",
    description:
      "Earthy, candlelit textures and collected heirlooms define this deeply layered look. Weathered wood, rich terracotta, and aged metals bring drama to a soulful, countryside-style retreat.",
  },
};

// ──────────────────────────────────────────────────────────────
// ROOM DESIGN LABEL HELPERS (Questions 1–3)
// ─────────────────────────────────────────────────────────────-

// Your answers object sometimes stores arrays. This helper always returns the first value as a string.
function firstAnswer(answers: Answers, key: string): string | undefined {
  const value = answers[key];
  if (value == null) return undefined;
  if (Array.isArray(value)) return value[0];
  return value;
}

function primaryUserLabelFromId(id?: string): string | undefined {
  switch (id) {
    case "guest":
      return "Guest bathroom";
    case "primary":
      return "Primary bathroom";
    case "children":
      return "Kids’ bathroom";
    case "teens":
      return "Teen bathroom";
    case "powder":
      return "Powder room";
    default:
      return undefined;
  }
}

function vanityLabelFromId(id?: string): string | undefined {
  switch (id) {
    case "single":
      return "Single vanity";
    case "double":
      return "Double vanity";
    default:
      return undefined;
  }
}

function bathingLabelFromId(id?: string): string | undefined {
  switch (id) {
    case "shower":
      return "Shower";
    case "tub":
      return "Tub";
    case "both":
      return "Tub and shower";
    default:
      return undefined;
  }
}

function buildRoomDesignSummary(
  primaryUserId?: string,
  vanityId?: string,
  bathingId?: string
): RoomDesignSummary {
  const primaryUserLabel = primaryUserLabelFromId(primaryUserId);
  const vanityLabel = vanityLabelFromId(vanityId);
  const bathingLabel = bathingLabelFromId(bathingId);

  const parts = [primaryUserLabel, vanityLabel, bathingLabel].filter(Boolean);
  const summarySentence =
    parts.length > 0
      ? `This design is for ${parts.join(" · ").toLowerCase()}.`
      : undefined;

  return {
    primaryUserLabel,
    vanityLabel,
    bathingLabel,
    summarySentence,
  };
}

// ──────────────────────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────────────────────-

export function generateResultText(
  result: StyleResult,
  answers: Answers
): GeneratedResultText {
  const {
    primaryArchetype,
    secondaryArchetype,
    modernRustic,
    minimalLayered,
    brightMoody,
  } = result;

  const primaryLabel = ARCHETYPE_LABELS[primaryArchetype];
  const secondaryLabel = secondaryArchetype
    ? ARCHETYPE_LABELS[secondaryArchetype]
    : undefined;

  // Style cluster (name + hero description)
  const lightKey: LightKey = lightKeyFromValue(brightMoody);
  const compKey: CompositionKey = compositionKeyFromValue(minimalLayered);
  const materialKey: MaterialKey = materialKeyFromValue(modernRustic);

  const clusterKey = `${primaryArchetype}_${lightKey}_${compKey}_${materialKey}` as StyleClusterKey;
  const cluster = STYLE_CLUSTERS[clusterKey];

  const styleName = cluster?.name ?? `${primaryLabel} Bath`;
  const baseDescription =
    cluster?.description ??
    "Your answers point to a clear, cohesive direction within this core style, balancing architecture, materials, and mood into a unified design language.";

  const coreSummary = CORE_STYLE_SUMMARY[primaryArchetype];
  const blendLine = getBlendLine(primaryArchetype, secondaryArchetype);

  // Usage → Room Design (Q1–Q3)
  const primaryUserId = firstAnswer(answers, "bathroom_primary_user");
  const vanityId = firstAnswer(answers, "bathroom_vanity_type");
  const bathingId = firstAnswer(answers, "bathroom_bathing_type");

  const roomDesign = buildRoomDesignSummary(
    primaryUserId,
    vanityId,
    bathingId
  );

  // Build a single paragraph: style description + archetype + optional blend
  const parts = [baseDescription, coreSummary, blendLine].filter(
    Boolean
  ) as string[];
  const description = parts.join(" ");

  return {
    roomDesign,
    title: styleName,
    styleName,
    description,
    primaryLabel,
    secondaryLabel,
  };
}
