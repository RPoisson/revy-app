//no longer in use - see fn-01 instead// revy-quiz/src/data/rules/bu-04.ts
import type { RevyRule } from "@/types/rules";

const bullets = (lines: string[]) => lines.map((l) => `• ${l}`).join("\n");

/**
 * NOTE
 * investment_range ids:
 * under_50 | 50_100 | 100_200 | 200_350 | 350_500 | 500_plus | not_sure
 *
 * spend_philosophy ids:
 * timeless_infrastructure | statement_moments | balanced | roi_first
 *
 * finish_level ids:
 * builder_plus | mid | high | very_high
 *
 * ownership_intent (derived in BriefPage):
 * live | rental
 */

// ──────────────────────────────────────────────────────────────
// BU-04A — Rental / flip (ROI + durability)
// ──────────────────────────────────────────────────────────────
export const BU_04A: RevyRule = {
  id: "BU-04A",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic: "ownership_intent == rental",

  primaryRecommendation:
    "For rentals or resale, prioritize durability, easy maintenance, and broad appeal over customization.",

  whyShowing:
    "You selected a rental or resale intent, so the most valuable spend is what reduces maintenance, replacements, and turnover.",

  badges: [
    {
      tone: "positive",
      icon: "check",
      title: "Spend here (durable + low upkeep)",
      text: bullets([
        "Hard-wearing flooring",
        "Reliable plumbing fixtures",
        "Stain-resistant counters",
        "Lighting with replaceable parts",
      ]),
    },
    {
      tone: "warning",
      icon: "warning",
      title: "Avoid / save here",
      text: bullets([
        "Unlacquered metals",
        "Soft stones that stain or patina",
        "Finishes needing frequent sealing",
        "Bespoke details without ROI",
      ]),
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// BU-04B — Builder-plus under pressure
// ──────────────────────────────────────────────────────────────
export const BU_04B: RevyRule = {
  id: "BU-04B",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic:
    "finish_level == builder_plus AND ownership_intent != rental AND remodel_complexity_score >= 60",

  primaryRecommendation:
    "With this level of scope, builder-plus finishes can limit where quality shows up. Consider moving to mid-range to protect the outcome.",

  whyShowing:
    "Your project scope is relatively complex for a builder-plus finish level, especially where kitchens, baths, or systems are involved.",

  badges: [
    {
      tone: "warning",
      icon: "warning",
      title: "Spend selectively",
      text: bullets([
        "One hero surface per key room",
        "Lighting that defines the space",
        "One daily-use upgrade",
      ]),
    },
    {
      tone: "warning",
      icon: "warning",
      title: "Simplify elsewhere",
      text: bullets([
        "Secondary surfaces",
        "Decorative tile complexity",
        "Custom details without payoff",
      ]),
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// BU-04C — Mid-range + balanced
// ──────────────────────────────────────────────────────────────
export const BU_04C: RevyRule = {
  id: "BU-04C",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic: "finish_level == mid AND spend_philosophy == balanced",

  primaryRecommendation:
    "Mid-range budgets perform best when you concentrate spend into a few high-impact decisions.",

  whyShowing:
    "You chose a balanced spend philosophy at a mid-range finish level, where budgets are most easily diluted.",

  badges: [
    {
      tone: "positive",
      icon: "check",
      title: "Splurge here",
      text: bullets([
        "Kitchen countertops",
        "Primary bath vanity or shower",
        "Statement lighting in main spaces",
      ]),
    },
    {
      tone: "positive",
      icon: "info",
      title: "Save here",
      text: bullets([
        "Secondary baths",
        "Tile coverage depth",
        "Decorative complexity",
      ]),
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// BU-04D — High investment / high finish (shared badges)
// ──────────────────────────────────────────────────────────────
const HIGH_END_BADGES = [
  {
    tone: "positive" as const,
    icon: "check" as const,
    title: "Where to focus",
    text: bullets([
      "Custom millwork",
      "Integrated storage and built-ins",
      "Architectural or layered lighting",
      "Focal stone or tile moments",
      "Cohesive trim and hardware profiles",
    ]),
  },
];

// ──────────────────────────────────────────────────────────────
// BU-04D1 — $350–500k · High-end · Live-in
// ──────────────────────────────────────────────────────────────
export const BU_04D1: RevyRule = {
  id: "BU-04D1",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic:
    "investment_range == 350_500 AND finish_level == high AND ownership_intent != rental",

  primaryRecommendation:
    "Lead with customization, not uniform upgrades. Focus on custom millwork, integrated storage, architectural lighting, and focal stone or tile moments.",

  whyShowing:
    "You selected a high investment range with a high-end finish level for a live-in home.",

  badges: HIGH_END_BADGES,
};

// ──────────────────────────────────────────────────────────────
// BU-04D2 — $350–500k · Very high-end · Live-in
// ──────────────────────────────────────────────────────────────
export const BU_04D2: RevyRule = {
  id: "BU-04D2",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic:
    "investment_range == 350_500 AND finish_level == very_high AND ownership_intent != rental",

  primaryRecommendation:
    "Custom millwork, integrated storage, layered lighting, premium materials, and cohesive trim and hardware profiles will define the outcome. Avoid trend-driven finishes with short shelf life.",

  whyShowing:
    "You selected a high investment range with a very high-end finish level for a live-in home.",

  badges: HIGH_END_BADGES,
};

// ──────────────────────────────────────────────────────────────
// BU-04D3 — $500k+ · High-end · Live-in
// ──────────────────────────────────────────────────────────────
export const BU_04D3: RevyRule = {
  id: "BU-04D3",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic:
    "investment_range == 500_plus AND finish_level == high AND ownership_intent != rental",

  primaryRecommendation:
    "Create personalized defining moments. Spend on custom or semi-custom millwork, architectural lighting, and standout material moments—personalized to your taste.",

  whyShowing:
    "You selected a $500k+ investment range with a high-end finish level for a live-in home.",

  badges: HIGH_END_BADGES,
};

// ──────────────────────────────────────────────────────────────
// BU-04D4 — $500k+ · Very high-end · Live-in
// ──────────────────────────────────────────────────────────────
export const BU_04D4: RevyRule = {
  id: "BU-04D4",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic:
    "investment_range == 500_plus AND finish_level == very_high AND ownership_intent != rental",

  primaryRecommendation:
    "Design-led investment wins here. Prioritize custom millwork, bespoke built-ins, premium lighting, and cohesive detailing across doors, trim, and hardware.",

  whyShowing:
    "You selected a $500k+ investment range with a very high-end finish level for a live-in home.",

  badges: HIGH_END_BADGES,
};

// ──────────────────────────────────────────────────────────────
// BU-04E — Tighter investment ranges / ROI-first
// ──────────────────────────────────────────────────────────────
const TIGHT_BUDGET_BADGES = [
  {
    tone: "warning" as const,
    icon: "warning" as const,
    title: "Spend here",
    text: bullets([
      "Lighting quality and placement",
      "Paint prep and finish",
      "One tactile upgrade that improves daily use",
    ]),
  },
  {
    tone: "positive" as const,
    icon: "check" as const,
    title: "Save here",
    text: bullets([
      "Decorative tile patterns",
      "Material variety",
      "Custom details without functional payoff",
    ]),
  },
];

export const BU_04E1: RevyRule = {
  id: "BU-04E1",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic: "investment_range == under_50",

  primaryRecommendation:
    "When budgets are tight, restraint creates better outcomes than material variety.",

  whyShowing:
    "You selected an under-$50k investment range, where trade-offs matter most.",

  badges: TIGHT_BUDGET_BADGES,
};

export const BU_04E2: RevyRule = {
  id: "BU-04E2",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic: "investment_range == 50_100",

  primaryRecommendation:
    "Focus spend on a few high-payoff decisions and keep the rest simple.",

  whyShowing:
    "You selected a $50k–$100k investment range, where focus matters more than variety.",

  badges: TIGHT_BUDGET_BADGES,
};

export const BU_04E3: RevyRule = {
  id: "BU-04E3",
  name: "Where to Splurge / Where to Save",
  category: "Budget · Allocation",
  triggerLogic: "spend_philosophy == roi_first AND ownership_intent != rental",

  primaryRecommendation:
    "If you’re optimizing for ROI and durability, spend where performance reduces regret and maintenance.",

  whyShowing:
    "You selected an ROI-first spend philosophy, even for a live-in home.",

  badges: [
    {
      tone: "positive",
      icon: "info",
      title: "Spend here",
      text: bullets([
        "Durable flooring and counters",
        "Plumbing fixtures with standard parts",
        "Good ventilation and water management",
      ]),
    },
    {
      tone: "positive",
      icon: "check",
      title: "Save here",
      text: bullets([
        "Highly taste-specific finishes",
        "Bespoke tile layouts",
        "Custom details without long-term payoff",
      ]),
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// Export family
// ──────────────────────────────────────────────────────────────
export const BU_04: RevyRule[] = [
  BU_04A,
  BU_04B,
  BU_04C,
  BU_04D1,
  BU_04D2,
  BU_04D3,
  BU_04D4,
  BU_04E1,
  BU_04E2,
  BU_04E3,
];
