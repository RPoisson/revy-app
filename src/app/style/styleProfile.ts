// src/app/style/styleProfile.ts

import { STYLE_DNA, type ArchetypeId, type AxisId } from "./styleDNA";
import { AXES, axisBandForValue, type AxisValue } from "./axesSchema";
import {
  STYLE_RENDER_MAP,
  type SlotId,
  type Weight,
  type WeightedTerm,
  type SlotRules,
} from "./style_render_map";

export type StyleProfileInput = {
  archetype: ArchetypeId;

  // If omitted, we’ll default to archetype sliderHintsDefault from STYLE_DNA.
  axes?: Partial<Record<AxisId, AxisValue>>;

  // Optional: allow a small amount of tuning per room or user (future-proof)
  context?: {
    roomType?: string; // e.g. "bathroom", "kitchen"
    preferMoreVariation?: boolean;
  };

  // Optional: if you want to pin certain heroes at runtime (planner decisions)
  pinnedHeroTerms?: Partial<Record<SlotId, string[]>>;
};

export type AxisBandSummary = {
  axis: AxisId;
  value: number; // 0..1
  band: "low" | "mid" | "high";
  addSignals: string[];
  avoidSignals: string[];
};

export type EffectiveSlotSignals = {
  slot: SlotId;

  // Effective terms: render-map include terms + axis modulation terms
  include: WeightedTerm[];

  // Soft avoid strings: render-map avoidLite + axis avoidSignals
  avoidLite: string[];

  hardRules: string[];

  // Convenience lists for UX / auditing
  heroTerms: string[];
  promptHeader: string[];
};

export type BuiltStyleProfile = {
  archetype: ArchetypeId;

  // For UX/explainers
  styleDNA: typeof STYLE_DNA[ArchetypeId];

  // For audit/debug and training logs
  axes: Record<AxisId, number>;
  axisBands: AxisBandSummary[];

  // For retrieval/ranking and render spec creation
  promptHeader: string[];
  slots: Record<SlotId, EffectiveSlotSignals>;
};

/**
 * Tuning knobs: how strongly axes modulate include terms.
 * We keep it discrete and transparent.
 *
 * - addSignals from axes become weighted include terms
 * - avoidSignals from axes become avoidLite strings
 *
 * If you later want finer control, replace these constants with a per-axis config.
 */
const AXIS_ADD_WEIGHT: Record<AxisId, Weight> = {
  rustic_refined: 1,
  minimal_maximal: 1,
  organic_structured: 1,
};

/**
 * Assign axis signals to slots. This prevents axis “keywords” from polluting every slot.
 * Keep this intentionally small and auditable.
 */
const AXIS_SIGNAL_SLOT_MAP: Record<
  AxisId,
  { add: Partial<Record<SlotId, string[]>>; avoid: Partial<Record<SlotId, string[]>> }
> = {
  rustic_refined: {
    add: {
      countertop: [
        "polished_marble",
        "honed_stone",
        "thin_profiles",
        "crisp_edges",
        "chiseled_edges",
        "imperfect_edges",
      ],
      tile_floor: ["bush_hammered_stone", "polished_marble", "honed_stone", "heavy_grout"],
      tile_wall: ["smooth_plaster", "limewash", "soft_plaster"],
      vanity: ["visible_joinery", "thin_profiles", "chunky_silhouettes"],
      hardware: ["polished_brass", "polished_nickel", "patina_metal", "forged_metal"],
      lighting: ["polished_metal", "burnished_metals", "forged_metal"],
    },
    avoid: {
      tile_floor: ["mirror_glam", "high_sheen"],
      lighting: ["mirror_glam", "high_sheen"],
    },
  },

  minimal_maximal: {
    add: {
      tile_floor: ["consistent_flooring_color", "mosaics", "patterned_marble"],
      tile_wall: ["wallpaper", "subtle_patterns", "ornate_molding"],
      vanity: ["decorative_mirrors", "fluting", "scrolls_fluting"],
      lighting: ["sculptural_fixtures", "patterned_shades", "crystal"],
      architecture: ["selective_molding", "ornate_molding"],
    },
    avoid: {
      tile_floor: ["too_uniform"],
      tile_wall: ["too_blank"],
      vanity: ["too_blank"],
    },
  },

  organic_structured: {
    add: {
      tile_floor: ["symmetry", "grid_logic", "crisp_alignment", "handmade_variation", "irregular_stack"],
      tile_wall: ["border_logic", "framed_panels", "curved_forms"],
      vanity: ["symmetry", "softened_edges", "rounded_corners"],
      architecture: ["strong_verticals", "symmetry", "rounded_corners", "organic_arcs"],
      lighting: ["paired_sconces", "asymmetry"],
    },
    avoid: {
      tile_floor: ["over_precision", "over_symmetry"],
      lighting: ["over_precision"],
    },
  },
};

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

function normalizeTerm(t: string): string {
  return t.trim().toLowerCase();
}

function dedupeStrings(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const k = normalizeTerm(s);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

function dedupeWeightedTerms(list: WeightedTerm[]): WeightedTerm[] {
  // If the same term appears multiple times, keep the highest weight and merge notes.
  const map = new Map<string, WeightedTerm>();
  for (const wt of list) {
    const key = normalizeTerm(wt.term);
    if (!key) continue;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { ...wt });
      continue;
    }
    const keep =
      Math.abs(wt.weight) > Math.abs(prev.weight)
        ? wt
        : wt.weight === prev.weight
          ? prev
          : prev;
    const mergedNote =
      [prev.note, wt.note].filter(Boolean).join(" | ") || undefined;

    map.set(key, { ...keep, note: mergedNote });
  }
  return Array.from(map.values());
}

function axisSignalsFor(archetypeAxes: Record<AxisId, number>): AxisBandSummary[] {
  const out: AxisBandSummary[] = [];
  (Object.keys(AXES) as AxisId[]).forEach((axisId) => {
    const v = clamp01(archetypeAxes[axisId]);
    const band = axisBandForValue(v);
    const def = AXES[axisId];
    const bandDef = def.bands.find((b) => b.band === band);
    out.push({
      axis: axisId,
      value: v,
      band,
      addSignals: bandDef?.signals.add ?? [],
      avoidSignals: bandDef?.signals.avoid ?? [],
    });
  });
  return out;
}

/**
 * Build the merged StyleProfile:
 * - starts from STYLE_DNA defaults
 * - overlays user-provided axis values
 * - merges STYLE_RENDER_MAP slot includes/avoids with axis band add/avoid signals
 * - returns an auditable object you can log and pass into planner/retriever/renderer
 */
export function buildStyleProfile(input: StyleProfileInput): BuiltStyleProfile {
  const dna = STYLE_DNA[input.archetype];
  const renderMap = STYLE_RENDER_MAP[input.archetype];

  // Resolve axes: defaults from DNA, overridden by input.axes
  const axesResolved: Record<AxisId, number> = {
    rustic_refined: clamp01(input.axes?.rustic_refined ?? dna.sliderHintsDefault.rustic_refined),
    minimal_maximal: clamp01(input.axes?.minimal_maximal ?? dna.sliderHintsDefault.minimal_maximal),
    organic_structured: clamp01(input.axes?.organic_structured ?? dna.sliderHintsDefault.organic_structured),
  };

  const axisBands = axisSignalsFor(axesResolved);

  // Build effective per-slot signals
  const slots = {} as Record<SlotId, EffectiveSlotSignals>;

  (Object.keys(renderMap.slots) as SlotId[]).forEach((slotId) => {
    const base: SlotRules = renderMap.slots[slotId];

    const include: WeightedTerm[] = [...(base.include ?? [])];
    const avoidLite: string[] = [...(base.avoidLite ?? [])];
    const hardRules: string[] = [...(base.hardRules ?? [])];
    const heroTerms: string[] = [...(base.heroTerms ?? [])];

    // Apply pinned hero terms (optional): add as strong signals so they win ranking
    const pinned = input.pinnedHeroTerms?.[slotId];
    if (pinned?.length) {
      for (const p of pinned) include.push({ term: p, weight: 3 as Weight, note: "PINNED_HERO" });
    }

    // Apply axis modulation (slot-scoped)
    for (const ax of axisBands) {
      const map = AXIS_SIGNAL_SLOT_MAP[ax.axis];
      const addToSlot = map.add?.[slotId] ?? [];
      const avoidInSlot = map.avoid?.[slotId] ?? [];

      // Add axis “add” signals as weighted terms (soft bias)
      if (addToSlot.length) {
        const w = AXIS_ADD_WEIGHT[ax.axis];
        for (const term of addToSlot) {
          // Only add if it exists in this band’s addSignals list (prevents pollution)
          if (ax.addSignals.includes(term)) {
            include.push({ term, weight: w, note: `AXIS:${ax.axis}:${ax.band}` });
          }
        }
      }

      // Add axis “avoid” signals (soft avoid)
      if (avoidInSlot.length) {
        for (const term of avoidInSlot) {
          if (ax.avoidSignals.includes(term)) {
            avoidLite.push(`${term} (axis:${ax.axis}:${ax.band})`);
          }
        }
      }
    }

    // Optional: light context tuning (kept minimal so it stays auditable)
    if (input.context?.preferMoreVariation) {
      if (slotId === "tile_floor" || slotId === "tile_wall") {
        include.push({ term: "variation_ok", weight: 1, note: "CTX:preferMoreVariation" });
      }
    }

    slots[slotId] = {
      slot: slotId,
      include: dedupeWeightedTerms(include),
      avoidLite: dedupeStrings(avoidLite),
      hardRules: dedupeStrings(hardRules),
      heroTerms: dedupeStrings(heroTerms),
      promptHeader: renderMap.promptHeader,
    };
  });

  return {
    archetype: input.archetype,
    styleDNA: dna,
    axes: axesResolved,
    axisBands,
    promptHeader: renderMap.promptHeader,
    slots,
  };
}

/**
 * Convenience helpers for logging / debugging:
 * Create a compact audit-friendly summary.
 */
export function summarizeStyleProfile(profile: BuiltStyleProfile): string {
  const lines: string[] = [];
  lines.push(`Archetype: ${profile.archetype}`);
  lines.push(
    `Axes: rustic_refined=${profile.axes.rustic_refined.toFixed(2)}, minimal_maximal=${profile.axes.minimal_maximal.toFixed(
      2
    )}, organic_structured=${profile.axes.organic_structured.toFixed(2)}`
  );
  lines.push(`Prompt header: ${profile.promptHeader.join(", ")}`);
  for (const slotId of Object.keys(profile.slots) as SlotId[]) {
    const s = profile.slots[slotId];
    lines.push(`\n[${slotId}]`);
    lines.push(`  Hard rules: ${s.hardRules.length ? s.hardRules.join(" • ") : "—"}`);
    lines.push(`  Hero terms: ${s.heroTerms.length ? s.heroTerms.join(" • ") : "—"}`);
    lines.push(
      `  Include terms (top): ${s.include
        .slice()
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 8)
        .map((t) => `${t.term}:${t.weight}`)
        .join(", ")}`
    );
    lines.push(`  Avoid-lite: ${s.avoidLite.length ? s.avoidLite.slice(0, 6).join(", ") : "—"}`);
  }
  return lines.join("\n");
}
