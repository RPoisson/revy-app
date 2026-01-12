// revy-quiz/src/data/rules/fn-02.ts
import type { RevyRule } from "@/types/rules";

const bullets = (lines: string[]) => lines.map((l) => `• ${l}`).join("\n");

/**
 * FN-02 is a foundational Revy philosophy.
 * It should always be shown (no trigger / no conditions).
 *
 * Context fields: none required
 */

export const FN_02: RevyRule = {
  id: "FN-02",
  name: "Permanence & Expression Tiering",
  category: "Finish · Strategy",

  // Always show (foundation principle)
  triggerLogic: "",

  primaryRecommendation:
    "Place personality in reversible layers before you lock it into permanent decisions—this keeps the home flexible, timeless, and easier to evolve over time.",

  whyShowing:
    "This is a core Revy principle: the most confident homes keep the “bones” calm and timeless, and express personality through layers you can easily update later.",

  badges: [
    {
      tone: "positive",
      icon: "check",
      title: "Where personality works best",
      text: bullets([
        "Paint and wall finishes",
        "Lighting (statement fixtures + layered ambient)",
        "Textiles (rugs, drapery, upholstery)",
        "Art and decorative objects",
        "Selective hardware moments",
      ]),
    },
    {
      tone: "positive",
      icon: "info",
      title: "Where to stay neutral",
      text: bullets([
        "Tile foundations",
        "Countertops and slabs",
        "Millwork and cabinetry profiles",
        "Plumbing placement and layouts",
        "Built-ins and permanent architectural decisions",
      ]),
    },
    {
      tone: "warning",
      icon: "warning",
      title: "Design check",
      text: bullets([
        "Confirm your appetite for future changes",
        "If tastes evolve, will this choice still work—or require demolition?",
        "Reserve bold color, dramatic veining, and high-contrast pattern for reversible layers first",
      ]),
    },
  ],
};
