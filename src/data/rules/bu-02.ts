// revy-quiz/src/data/rules/bu-02.ts
import type { RevyRule } from "@/types/rules";

export const BU_02: RevyRule = {
  id: "BU-02",
  name: "Budget Guardrail: Finish Tier Translation (Builder-plus)",
  category: "Budget · Aesthetic Integrity",

  // Only flag for builder-plus
  triggerLogic: "finish_level == 'builder_plus'",

  primaryRecommendation:
    "At a builder-plus finish tier, we’ll translate French California Home into clean, elevated basics — prioritizing restraint, proportion, and a few well-chosen moments over widespread premium materials.",

  whyShowing:
    "This appears because you selected the Builder-Plus finish tier. French California Home aesthetics depend on thoughtful material choices. To ensure the best outcome at this level, we’ll be selective and invest where it counts.",

  badges: [
    {
      tone: "neutral",
      icon: "info",
      title: "This is about aesthetic integrity (not feasibility)",
      text:
        "This guardrail helps keep the design promise coherent at a builder-plus tier. It doesn’t mean compromising taste — it means making deliberate choices that still feel intentional and designed.",
    },
  ],

  sections: [
    {
      id: "key-constraints",
      title: "Key constraints we’ll design within",
      subsections: [
        {
          title: "What to expect at this tier",
          bullets: [
            "We’ll simplify material coverage and avoid over-promising premium surfaces at this tier.",
            "The goal is not ‘luxury everywhere’ — it’s restraint that still feels designed.",
            "One defining ‘moment’ per key room (mirror, sconce, or feature surface) instead of premium materials everywhere.",
            "Shapes, scale, and contrast will carry the style, even with simpler finishes.",
          ],
        },
      ],
    },
  ],

  disclaimer: {
    patternId: "directional_guidance",
  },
};
