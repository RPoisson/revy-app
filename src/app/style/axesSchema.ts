// src/app/style/axesSchema.ts

import type { AxisId } from "./styleDNA";

/**
 * Axes are orthogonal modifiers. They should NOT redefine archetypes;
 * they modulate selection/ranking and prompt guidance.
 */

export type AxisTriState = "low" | "mid" | "high";

export type AxisValue = number; // 0..1

export type AxisBand = {
  band: AxisTriState;
  range: [number, number]; // inclusive lower, exclusive upper (except last)
  // Signals here are *generic* features you can map to product tags / prompt terms.
  signals: {
    add: string[];      // positive bias
    avoid: string[];    // negative bias (soft)
  };
  notes: string[];
};

export type AxisDefinition = {
  id: AxisId;
  label: string;
  description: string;
  bands: AxisBand[];
};

export const AXES: Record<AxisId, AxisDefinition> = {
  rustic_refined: {
    id: "rustic_refined",
    label: "Rustic ↔ Refined",
    description:
      "Controls patina, edge crispness, finish sheen, joinery visibility, and overall polish.",
    bands: [
      {
        band: "low",
        range: [0.0, 0.34],
        signals: {
          add: [
            "raw_wood",
            "bush_hammered_stone",
            "limewash",
            "patina_metal",
            "high_texture",
            "visible_joinery",
            "imperfect_edges",
          ],
          avoid: [
            "polished_metal",
            "high_sheen",
            "crisp_thin_profiles",
            "mirror_glam",
          ],
        },
        notes: ["Organic, earthy, lived-in warmth.", "More tactile texture and patina."],
      },
      {
        band: "mid",
        range: [0.34, 0.67],
        signals: {
          add: [
            "honed_stone",
            "natural_brass",
            "soft_plaster",
            "mixed_matte_finishes",
            "light_patina",
          ],
          avoid: ["extreme_polish", "extreme_roughness"],
        },
        notes: ["Refined yet grounded.", "Balanced patina and clean detailing."],
      },
      {
        band: "high",
        range: [0.67, 1.01],
        signals: {
          add: [
            "polished_marble",
            "smooth_plaster",
            "polished_brass",
            "polished_nickel",
            "thin_profiles",
            "crisp_edges",
            "tailored_detailing",
          ],
          avoid: [
            "overly_rustic",
            "heavy_grout",
            "primitive_joinery",
            "chunky_silhouettes",
          ],
        },
        notes: ["Urban sophistication.", "High polish, controlled texture."],
      },
    ],
  },

  minimal_maximal: {
    id: "minimal_maximal",
    label: "Minimal ↔ Maximal",
    description:
      "Controls pattern density, layer count, decorative detail, and visual richness.",
    bands: [
      {
        band: "low",
        range: [0.0, 0.34],
        signals: {
          add: [
            "monochrome_surfaces",
            "consistent_flooring_color",
            "simple_marble",
            "solid_linens",
            "plaster_walls",
            "floating_shelves",
          ],
          avoid: ["wallpaper", "mixed_prints", "ornate_molding", "patterned_marble", "mosaic_rugs"],
        },
        notes: ["Airy, calm, architectural.", "Low pattern and fewer layers."],
      },
      {
        band: "mid",
        range: [0.34, 0.67],
        signals: {
          add: [
            "layered_textures",
            "subtle_patterns",
            "selective_molding",
            "sculptural_accents",
            "medium_contrast",
          ],
          avoid: ["overlayering", "overdecoration"],
        },
        notes: ["Layered, warm, editorial.", "Controlled pattern and detail."],
      },
      {
        band: "high",
        range: [0.67, 1.01],
        signals: {
          add: [
            "wallpaper",
            "patterned_marble",
            "mosaics",
            "decorative_mirrors",
            "scrolls_fluting",
            "ornate_molding",
            "mixed_prints",
            "tassels_fringe",
          ],
          avoid: ["too_blank", "too_uniform"],
        },
        notes: ["Expressive, character-rich.", "High pattern + layered detail."],
      },
    ],
  },

  organic_structured: {
    id: "organic_structured",
    label: "Organic ↔ Structured",
    description:
      "Controls symmetry, geometry sharpness, edge softness, and composition discipline.",
    bands: [
      {
        band: "low",
        range: [0.0, 0.34],
        signals: {
          add: [
            "symmetry",
            "strong_verticals",
            "crisp_alignment",
            "grid_logic",
            "slender_proportions",
          ],
          avoid: ["irregular_stack", "handmade_variation", "asymmetry"],
        },
        notes: ["Structured, tailored composition.", "Symmetry and clear geometry."],
      },
      {
        band: "mid",
        range: [0.34, 0.67],
        signals: {
          add: [
            "softened_edges",
            "balanced_geometry",
            "light_variation",
            "approachable_structure",
          ],
          avoid: ["extreme_rigidity", "extreme_randomness"],
        },
        notes: ["Structured yet softened.", "A mix of discipline and warmth."],
      },
      {
        band: "high",
        range: [0.67, 1.01],
        signals: {
          add: [
            "organic_arcs",
            "rounded_corners",
            "handmade_variation",
            "irregular_stack",
            "imperfect_rhythm",
          ],
          avoid: ["over_symmetry", "over_precision"],
        },
        notes: ["Organic, breezy, imperfect.", "Soft forms and natural rhythm."],
      },
    ],
  },
};

export function axisBandForValue(value: AxisValue): AxisTriState {
  if (value < 0.34) return "low";
  if (value < 0.67) return "mid";
  return "high";
}
