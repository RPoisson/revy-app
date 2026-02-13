// src/app/brief/designDirectionByExterior.ts

/**
 * Maps the selected exterior architecture to a Revy Design Direction paragraph.
 * Source of truth: your authored “Revy Design Direction (Brief Language)” copy.
 *
 * NOTE: This mapping expects the option ids from `src/questions.ts`:
 * - cape_cod
 * - colonial
 * - contemporary_modern
 * - craftsman
 * - french_provincial
 * - mediterranean_spanish
 * - midcentury_modern
 * - modern_farmhouse
 * - ranch
 * - tudor_english_cottage
 * - victorian
 */

export type ExteriorStyleId =
  | "french_provincial"
  | "mediterranean_spanish"
  | "cape_cod"
  | "colonial"
  | "craftsman"
  | "modern_farmhouse"
  | "ranch"
  | "midcentury_modern"
  | "contemporary_modern"
  | "tudor_english_cottage"
  | "victorian";

export const DESIGN_DIRECTION_BY_EXTERIOR: Record<ExteriorStyleId, string> = {
  french_provincial:
    "Design should emphasize balance, refinement, and timeless proportion. Materials should feel substantial and considered, with a focus on symmetry, soft contrast, and details that reference tradition without feeling ornate. Interiors should feel layered, calm, and quietly elegant rather than expressive or trend-forward.",

  mediterranean_spanish:
    "Design should feel grounded, warm, and tactile. Emphasis on natural materials, soft edges, and a sense of indoor–outdoor continuity. Finishes should age well and feel honest, favoring texture and patina over polish or sharp contrast.",

  cape_cod:
    "Design should feel restrained, bright, and enduring. Favor classic proportions, light-filled spaces, and materials that feel familiar and unfussy. The overall direction should prioritize comfort and longevity over strong statements or visual complexity.",

  colonial:
    "Design should reinforce order, clarity, and symmetry. Interior decisions should feel intentional and measured, with an emphasis on proportion and consistency across rooms. Avoid overly rustic details.",

  craftsman:
    "Design should highlight warmth, craftsmanship, and material integrity. Natural finishes, subtle variation, and thoughtful detailing are key. The direction should feel grounded rather than formal or highly polished.",

  modern_farmhouse:
    "Design should balance structure with softness. Clean lines and simple forms should be warmed through texture, material variation, and lived-in details. Avoid extremes—neither overly rustic nor overly sleek.",

  ranch:
    "Design should emphasize ease, flow, and connection between spaces. Materials should feel relaxed and durable, with fewer visual interruptions. Favor continuity and horizontality over formality or ornamentation.",

  midcentury_modern:
    "Design should highlight clarity, contrast, and intentional simplicity. Materials should be expressive but controlled, with strong geometry and thoughtful negative space. Avoid excess layering or decorative complexity.",

  contemporary_modern:
    "Design should feel deliberate, edited, and confident. Focus on proportion, material quality, and subtle contrast rather than decoration. Each element should feel purposeful, with restraint guiding decisions.",

  tudor_english_cottage:
    "Design should feel intimate, layered, and rooted in tradition. Emphasize warmth, depth, and subtle irregularity. Avoid minimalism or high contrast that undermines the architecture’s character.",

  victorian:
    "Design should respect ornament, scale, and historical rhythm. Interiors can be expressive, but decisions should feel cohesive and intentional. Balance detail with restraint.",
};

/** Defensive helper if the answer is missing or unexpected. */
export function getDesignDirectionForExterior(
  exteriorId?: string
): string | null {
  if (!exteriorId) return null;
  return (
    DESIGN_DIRECTION_BY_EXTERIOR[exteriorId as ExteriorStyleId] ?? null
  );
}

/** Optional: display label for the summary page. */
export const EXTERIOR_LABELS: Record<ExteriorStyleId, string> = {
  french_provincial: "French Provincial",
  mediterranean_spanish: "Mediterranean / Spanish",
  cape_cod: "Cape Cod",
  colonial: "Colonial",
  craftsman: "Craftsman",
  modern_farmhouse: "Modern Farmhouse",
  ranch: "Ranch",
  midcentury_modern: "Mid-Century Modern",
  contemporary_modern: "Contemporary Modern",
  tudor_english_cottage: "Tudor / English Cottage",
  victorian: "Victorian",
};

export function getExteriorLabel(exteriorId?: string): string | null {
  if (!exteriorId) return null;
  return EXTERIOR_LABELS[exteriorId as ExteriorStyleId] ?? null;
}
