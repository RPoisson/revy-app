// src/app/resultText.ts
import type { StyleResult, Answers } from "./scoring";
import type { Archetype } from "./styleWeights";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

type LightKey = "light_filled" | "tonal" | "moody";
type CompositionKey = "minimal" | "curated" | "layered";
type MaterialKey = "modern" | "textured" | "rustic";

export interface RoomDesignSummary {
  primaryUserLabel?: string;
  vanityLabel?: string;
  bathingLabel?: string;
  summarySentence?: string;
}

export interface GeneratedResultText {
  roomDesign: RoomDesignSummary;

  title: string;        // algorithmic title
  styleName: string;    // same as title for now
  description: string;  // archetype/blend + axis sentence(s) + examples

  primaryLabel: string;
  secondaryLabel?: string;
}

// ──────────────────────────────────────────────────────────────
// Archetype labels + core summaries (locked)
// ──────────────────────────────────────────────────────────────

const ARCHETYPE_LABELS: Record<Archetype, string> = {
  parisian: "Parisian",
  mediterranean: "Mediterranean",
  provincial: "Provincial",
};

const CORE_STYLE_SUMMARY: Record<Archetype, string> = {
  parisian:
    "At the core, your taste reflects urban elegance, drawing from Parisian heritage and Art Deco lineage, with structured detailing.",
  mediterranean:
    "At the core, your taste reflects informal coastal ease, drawing from Mediterranean heritage, with bohemian details and handcrafted accents.",
  provincial:
    "At the core, your taste reflects functional countryside simplicity, drawing from provincial heritage, with enduring craftsmanship and grounded simplicity.",
};

// ──────────────────────────────────────────────────────────────
// Blend descriptions (locked, lossless)
// ──────────────────────────────────────────────────────────────

const BLEND_LINES: Record<string, string> = {
  "parisian-provincial":
    "A blend of urban elegance and functional countryside simplicity—combining Parisian and provincial heritage, Art Deco lineage, enduring craftsmanship, and grounded simplicity.",
  "parisian-mediterranean":
    "A blend of urban elegance and informal coastal ease—combining Parisian and Mediterranean heritage, Art Deco lineage, structured detailing, bohemian details, and handcrafted accents.",
  "provincial-mediterranean":
    "A blend of functional countryside simplicity and informal coastal ease—combining provincial and Mediterranean heritage, enduring craftsmanship, grounded simplicity, bohemian details, and handcrafted accents.",
};

function getBlendLine(primary: Archetype, secondary?: Archetype): string | null {
  if (!secondary) return null;
  const directKey = `${primary}-${secondary}`;
  const reverseKey = `${secondary}-${primary}`;
  return BLEND_LINES[directKey] ?? BLEND_LINES[reverseKey] ?? null;
}

// ──────────────────────────────────────────────────────────────
// Axis bucketing (3-way, locked thresholds)
// ──────────────────────────────────────────────────────────────

function lightKeyFromValue(v: number): LightKey {
  if (v < 0.4) return "light_filled";
  if (v <= 0.6) return "tonal";
  return "moody";
}

function compositionKeyFromValue(v: number): CompositionKey {
  if (v < 0.4) return "minimal";
  if (v <= 0.6) return "curated";
  return "layered";
}

function materialKeyFromValue(v: number): MaterialKey {
  if (v < 0.4) return "modern";
  if (v <= 0.6) return "textured";
  return "rustic";
}

// ──────────────────────────────────────────────────────────────
// Algorithmic title adjectives (locked)
// ──────────────────────────────────────────────────────────────

const TITLE_ADJECTIVES = {
  light: {
    light_filled: "Light-Filled",
    tonal: "Tonal",
    moody: "Moody",
  } satisfies Record<LightKey, string>,
  composition: {
    minimal: "Minimal",
    curated: "Curated",
    layered: "Layered",
  } satisfies Record<CompositionKey, string>,
  material: {
    modern: "Modern",
    textured: "Textured",
    rustic: "Rustic",
  } satisfies Record<MaterialKey, string>,
};

function buildTitle(
  primaryLabel: string,
  secondaryLabel: string | undefined,
  lightKey: LightKey,
  compKey: CompositionKey,
  materialKey: MaterialKey
): string {
  const adjectives = [
    TITLE_ADJECTIVES.light[lightKey],
    TITLE_ADJECTIVES.composition[compKey],
    TITLE_ADJECTIVES.material[materialKey],
  ].join(" ");

  const archetypePart = secondaryLabel
    ? `${primaryLabel} × ${secondaryLabel}`
    : primaryLabel;

  return `${adjectives} ${archetypePart}`;
}

// ──────────────────────────────────────────────────────────────
// Axis sentences (locked)
// ──────────────────────────────────────────────────────────────

const LIGHT_LEAD: Record<LightKey, string> = {
  light_filled: "The space feels light-filled, open, and",
  tonal: "The space feels balanced and tonal, with gentle contrast and depth, and",
  moody: "The space feels moody and enveloping, and",
};

const ROOM_TAIL: Record<CompositionKey, string> = {
  minimal: "is calm, restrained, and uncluttered.",
  curated: "is intentional and thoughtfully composed.",
  layered: "is collected and expressive.",
};

const MATERIAL_SENTENCE: Record<MaterialKey, string> = {
  modern: "Materials are clean and contemporary.",
  textured: "Materials are tactile and softly expressive.",
  rustic: "Materials are timeworn and full of character.",
};

function buildAxisText(
  lightKey: LightKey,
  compKey: CompositionKey,
  materialKey: MaterialKey
): string {
  const sentence1 = `${LIGHT_LEAD[lightKey]} ${ROOM_TAIL[compKey]}`;
  const sentence2 = MATERIAL_SENTENCE[materialKey];
  return `${sentence1} ${sentence2}`;
}

// ──────────────────────────────────────────────────────────────
// Illustrative examples (archetype × material) + blend variants
// ──────────────────────────────────────────────────────────────

const ARCHETYPE_EXAMPLES: Record<Archetype, Record<MaterialKey, string>> = {
  parisian: {
    modern: "Think polished marble, sculptural lighting, and refined metal accents.",
    textured:
      "Think honed stone, subtle plaster walls, and woven or cane details softening clean lines.",
    rustic:
      "Think patinaed wood, aged stone, and antique metal finishes layered into the space.",
  },
  mediterranean: {
    modern:
      "Think smooth plaster walls, simple stone surfaces, and clean-lined fixtures.",
    textured:
      "Think tumbled stone, woven elements, and handcrafted tile with visible variation.",
    rustic:
      "Think weathered wood, aged stone, and ceramic or terracotta details with a sense of history.",
  },
  provincial: {
    modern: "Think simple cabinetry, restrained stone, and straightforward detailing.",
    textured: "Think natural stone, solid wood, and woven accents.",
    rustic:
      "Think exposed beams, timeworn wood, and aged stone that show use and history.",
  },
};

const BLEND_EXAMPLES: Record<string, Record<MaterialKey, string>> = {
  "parisian-provincial": {
    modern: "Think polished marble, simple cabinetry, and refined metal accents.",
    textured:
      "Think honed stone, solid wood, and woven or cane details softening clean lines.",
    rustic:
      "Think patinaed wood, exposed beams, and antique metal finishes layered into the space.",
  },
  "parisian-mediterranean": {
    modern: "Think polished marble, smooth plaster walls, and clean-lined fixtures.",
    textured:
      "Think honed stone, woven elements, and handcrafted tile with visible variation.",
    rustic:
      "Think patinaed wood, aged stone, and ceramic or terracotta details with a sense of history.",
  },
  "provincial-mediterranean": {
    modern: "Think simple cabinetry, smooth plaster walls, and clean-lined fixtures.",
    textured:
      "Think natural stone, woven elements, and handcrafted tile with visible variation.",
    rustic:
      "Think exposed beams, weathered wood, and ceramic or terracotta details with a sense of history.",
  },
};

function getExampleSentence(
  primary: Archetype,
  secondary: Archetype | undefined,
  materialKey: MaterialKey
): string {
  if (!secondary) return ARCHETYPE_EXAMPLES[primary][materialKey];

  const directKey = `${primary}-${secondary}`;
  const reverseKey = `${secondary}-${primary}`;
  const blend = BLEND_EXAMPLES[directKey] ?? BLEND_EXAMPLES[reverseKey];

  // Fallback (shouldn't happen if we cover all blends)
  return blend?.[materialKey] ?? ARCHETYPE_EXAMPLES[primary][materialKey];
}

// ──────────────────────────────────────────────────────────────
// Room design labels (Q1–Q3, unchanged)
// ──────────────────────────────────────────────────────────────

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

  return { primaryUserLabel, vanityLabel, bathingLabel, summarySentence };
}

// ──────────────────────────────────────────────────────────────
// Main generator
// ──────────────────────────────────────────────────────────────

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

  // Axis keys (3-way)
  const lightKey = lightKeyFromValue(brightMoody);
  const compKey = compositionKeyFromValue(minimalLayered);
  const materialKey = materialKeyFromValue(modernRustic);

  // Title
  const title = buildTitle(primaryLabel, secondaryLabel, lightKey, compKey, materialKey);

  // Room design (Q1–Q3)
  const primaryUserId = firstAnswer(answers, "bathroom_primary_user");
  const vanityId = firstAnswer(answers, "bathroom_vanity_type");
  const bathingId = firstAnswer(answers, "bathroom_bathing_type");
  const roomDesign = buildRoomDesignSummary(primaryUserId, vanityId, bathingId);

  // Description parts
  const opener = secondaryArchetype
    ? (getBlendLine(primaryArchetype, secondaryArchetype) ?? CORE_STYLE_SUMMARY[primaryArchetype])
    : CORE_STYLE_SUMMARY[primaryArchetype];

  const axisText = buildAxisText(lightKey, compKey, materialKey);
  const exampleSentence = getExampleSentence(primaryArchetype, secondaryArchetype, materialKey);

  const description = [opener, axisText, exampleSentence].filter(Boolean).join(" ");

  return {
    roomDesign,
    title,
    styleName: title,
    description,
    primaryLabel,
    secondaryLabel,
  };
}
