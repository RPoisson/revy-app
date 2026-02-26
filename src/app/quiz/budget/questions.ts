// src/app/quiz/budget/questions.ts
// Budget + philosophy questions (Step 2)

import type { Question } from "@/questions";

export const BUDGET_QUESTIONS: Question[] = [
  {
    id: "investment_range",
    title: "What investment range feels right for this project?",
subtitle: "This reflects the total project investment—including construction labor, finish materials, design and trade services, permits, and typical planning costs (such as surveys, reports, and inspections).”",
    
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    options: [
      { id: "under_50", label: "Under $50k" },
      { id: "50_100", label: "$50k–$100k" },
      { id: "100_200", label: "$100k–$200k" },
      { id: "200_350", label: "$200k–$350k" },
      { id: "350_500", label: "$350k–$500k" },
      { id: "500_plus", label: "$500k+" },
    ],
  },
  {
    id: "range_flexibility",
    title: "How fixed is this range?",
    subtitle: "So we can calibrate “must-haves” vs “nice-to-haves.”",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    options: [
      { id: "tight", label: "Tight", subtitle: "Need to stay within it" },
      {
        id: "some_buffer",
        label: "Some buffer",
        subtitle: "A little flexibility for the right result",
      },
      {
        id: "flexible",
        label: "Flexible",
        subtitle: "Open to investing if it materially improves outcome",
      },
      { id: "not_sure", label: "Not sure yet" },
    ],
  },
  
   
  {
    id: "finish_level",
    title: "What finish level are you aiming for?",
    subtitle: "This helps us recommend the right tier of materials and fixtures.",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    options: [
      {
        id: "builder_plus",
        label: "Builder-plus",
        subtitle: "Clean, elevated basics",
        tooltip:
          "Builder-Plus (Value): Utilizes high-quality, off-the-shelf essentials like ceramic tile and standard paint while avoiding exotic stones or plaster. In spaces like the kitchen, this look is achieved through pre-fabricated cabinetry and functional, value-priced hardware.",
      },
      {
        id: "mid",
        label: "Mid-range",
        subtitle: "Nice upgrades, mindful choices",
        tooltip:
          "Mid-Range (Elevated): Elevates the home with premium materials such as quartz, honed limestone, and polished nickel or unlacquered brass fixtures. In a laundry or dining room, this tier incorporates designer-grade lighting and textured surfaces to balance luxury with long-term durability.",
      },
      {
        id: "high",
        label: "High-end",
        subtitle: "Premium fixtures + statement finishes",
        tooltip:
          "High-End (Luxury): Prioritizes bespoke craftsmanship with custom cabinetry, full marble slabs, and hand-applied plaster walls. Living and kitchen areas feature high-fidelity architectural details such as intricate herringbone patterns and signature stone layouts.",
      },
    ],
  },
  
  
];
