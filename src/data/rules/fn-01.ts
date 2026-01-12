// revy-quiz/src/data/rules/fn-01.ts
import type { RevyRule } from "@/types/rules";

const bullets = (lines: string[]) => lines.map((l) => `• ${l}`).join("\n");

/**
 * Context fields expected from BriefPage:
 * ownership_mode: "live_in" | "rental" | "flip"
 * finish_level: "builder_plus" | "mid" | "high" | "very_high"
 *
 * NOTE:
 * - Removed any dependency on budget_fit (handled elsewhere, e.g. BU-01).
 * - Avoided parentheses in triggerLogic (your evaluator doesn't support them).
 */

export const FN_01A: RevyRule = {
  id: "FN-01A",
  name: "Finish Strategy: High-End, Personalized Details",
  category: "Finish · Strategy",

  // Base template rule (not used directly for triggering)
  triggerLogic: "",

  primaryRecommendation:
    "Lead with personalized, high-end details: custom, premium millwork, architectural lighting, and cohesive detailing.",

  whyShowing:
    "You selected a live-in home with high-end finishes—this is where custom, cohesive detailing defines the result.",

  badges: [
    {
      tone: "positive",
      icon: "check",
      title: "Prioritize",
      text: bullets([
        "Custom / premium millwork",
        "Architectural lighting (layered + dimmable)",
        "Cohesive detailing (doors, trim, hardware profiles)",
        "A few focal stone/tile moments done exceptionally well",
      ]),
    },
    {
      tone: "positive",
      icon: "info",
      title: "Be disciplined",
      text: bullets([
        "Avoid over-designing secondary spaces",
        "Don’t upgrade everything uniformly",
        "Stay away from trend-driven finishes with short shelf life",
      ]),
    },
  ],
};

export const FN_01B: RevyRule = {
  id: "FN-01B",
  name: "Finish Strategy: Rental (Tenant-Occupied)",
  category: "Finish · Strategy",

  triggerLogic: "ownership_mode == rental",

  primaryRecommendation:
    "Prioritize durability and low upkeep with a simple, neutral fixed-material palette.",

  whyShowing:
    "You selected a tenant-occupied rental, where finish choices should minimize maintenance, replacements, and mismatch risk between turnovers.",

  badges: [
    {
      tone: "positive",
      icon: "check",
      title: "Spend here",
      text: bullets([
        "Hard-wearing floors",
        "Reliable plumbing fixtures",
        "Stain-resistant surfaces",
        "Lighting with replaceable parts",
      ]),
    },
    {
      tone: "warning",
      icon: "warning",
      title: "Avoid",
      text: bullets([
        "Unlacquered metals",
        "Soft stones that stain or patina",
        "Finishes requiring sealing or special upkeep",
        "Overly bold fixed materials (tile/stone/cabinet colors)",
      ]),
    },
    {
      tone: "positive",
      icon: "info",
      title: "Palette guidance",
      text: bullets([
        "Keep stone/tile/floors/cabinetry neutral and cohesive",
        "Use personality in paint, lighting, and hardware",
      ]),
    },
  ],
};

export const FN_01C: RevyRule = {
  id: "FN-01C",
  name: "Finish Strategy: Flip / Resale",
  category: "Finish · Strategy",

  triggerLogic: "ownership_mode == flip",

  primaryRecommendation:
    "Use neutral fixed materials for broad appeal, with calculated statement moments that photograph well.",

  whyShowing:
    "You selected an immediate flip/resale, where buyers respond best to cohesive, broadly appealing fixed finishes with a few memorable moments.",

  badges: [
    {
      tone: "positive",
      icon: "check",
      title: "Default palette (broad appeal)",
      text: bullets([
        "Neutral stone, tile, and cabinetry",
        "Classic flooring tones",
        "Simple, cohesive finish transitions",
      ]),
    },
    {
      tone: "positive",
      icon: "info",
      title: "Calculated statement moments",
      text: bullets([
        "One standout light fixture (entry/dining)",
        "One focal tile moment (powder/backsplash)",
        "One defining stone moment (island/vanity)",
      ]),
    },
  ],
};

// Your evaluator does NOT support parentheses.
// So we include “OR” variants for FN_01A as separate rules (no budget_fit).

export const FN_01A2: RevyRule = {
  ...FN_01A,
  id: "FN-01A2",
  triggerLogic: "ownership_mode == live_in AND finish_level == high",
};

export const FN_01A3: RevyRule = {
  ...FN_01A,
  id: "FN-01A3",
  triggerLogic: "ownership_mode == live_in AND finish_level == very_high",
};

export const FN_01: RevyRule[] = [FN_01A2, FN_01A3, FN_01B, FN_01C];
