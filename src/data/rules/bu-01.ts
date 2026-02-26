import type { RevyRule } from "@/types/rules";

export const BU_01: RevyRule = {
  id: "BU-01",
  name: "Budget Guardrail: Scope ↔ Investment Fit",
  category: "Budget · Feasibility",

  // Show only when mismatch is flagged as moderate or high by your budget-fit evaluator
  // (see notes below for required computed fields)
  triggerLogic: "budget_mismatch_risk != low",

  primaryRecommendation:
    "Your selected spaces and finish level may require trade-offs within your current investment range. Before you start, it’s worth rebalancing priorities so the budget supports the rooms that matter most.",

  whyShowing:
    "This appears because your selected scope and finish ambition are likely to exceed what your current investment range can comfortably support based on typical installed finish costs.",

  badges: [
    {
      tone: "neutral",
      icon: "info",
      title: "This is a budget-fit check (not a quote)",
      text:
        "These guardrails are directional and based on typical installed finish ranges. Your final numbers will depend on region, existing conditions, and what’s already being reused.",
    },
    {
      tone: "warning",
      icon: "warning",
      title: "Trade-offs are likely",
      text:
        "Your inputs suggest you’ll need to prioritize which rooms get premium finishes and where to simplify to stay on track.",
    },
  ],

  alwaysVisibleConstraints: [
    "Kitchens and bathrooms typically consume the largest share of finish investment",
    "High-end finishes multiply costs quickly across multiple rooms",
    "Secondary rooms can add up when several are included",
    "Budget-fit checks are directional, not a contractor quote",
  ],

  sections: [
    {
      id: "what-this-means",
      title: "What this means for your project",
      subsections: [
        {
          title: "Moderate mismatch (trade-offs needed)",
          bullets: [
            "Your project can still be achievable, but priorities will matter.",
            "Decide which rooms are “hero spaces” and which rooms should stay simpler.",
            "Aim to lock fixtures, tile, cabinetry, and lighting earlier to avoid late cost creep.",
          ],
          visibilityCondition: "budget_mismatch_risk == moderate",
        },
        {
          title: "High mismatch (not feasible as entered)",
          bullets: [
            "Based on typical installed finish costs, your current inputs are unlikely to fit your investment range as entered.",
            "To move forward, you’ll need to adjust at least one: scope (rooms), finish level, or investment range.",
            "Rebalancing early prevents expensive surprises once procurement and installation begin.",
          ],
          visibilityCondition: "budget_mismatch_risk == high",
        },
      ],
    },

    {
      id: "budget-transparency",
      title: "Budget transparency",
      subsections: [
        {
          title: "Why you’re seeing this",
          bullets: [
            "This is triggered when your estimated finish needs exceed your budget comfort zone.",
            "We use typical installed finish ranges by room to detect misalignment before decisions get locked.",
          ],
        },
        // Restore when bm_comparable_range is populated:
        // {
        //   title: "Comparable finish scope range (shown only when risk is high)",
        //   bullets: [
        //     "Comparable finish scopes often land around: {{bm_comparable_range}}",
        //     "This range is directional and depends heavily on region and existing conditions.",
        //   ],
        //   visibilityCondition: "budget_mismatch_risk == high",
        // },
      ],
    },

    {
      id: "how-to-rebalance",
      title: "How to rebalance without sacrificing taste",
      subsections: [
        {
          title: "Protect what matters most",
          bullets: [
            "Pick 1–2 hero rooms (often kitchen + primary bath, or one shared living space).",
            "Keep premium materials where they’re most visible and most used.",
            "Simplify hidden surfaces (backsplashes, secondary tile, hardware mixes) before compromising the overall concept.",
          ],
        },
        {
          title: "Common moves that preserve quality",
          bullets: [
            "Use a statement tile in a single focal location rather than across all walls.",
            "Choose fewer fixture finishes and repeat them consistently for a high-end look.",
            "Prioritize lighting in key sightlines; keep secondary rooms simple and cohesive.",
            "Phase lower-priority rooms rather than spreading the budget thin across everything.",
          ],
        },
      ],
    },

    {
      id: "room-drivers",
      title: "Which rooms typically drive the budget (and why)",
      subsections: [
        {
          title: "Kitchen",
          bullets: [
            "Cabinetry, surfaces, fixtures, and installation complexity often make this the largest finish investment.",
          ],
          visibilityCondition: "rooms include any of {kitchen}",
        },
        {
          title: "Primary bathroom",
          bullets: [
            "Tile, plumbing fixtures, and multiple surfaces can rival kitchen-level finish investment.",
          ],
          visibilityCondition: "rooms include any of {primary_bath}",
        },
        {
          title: "Secondary bathrooms",
          bullets: [
            "Multiple bathrooms add up quickly due to tile + plumbing work repeated across rooms.",
          ],
          visibilityCondition:
            "rooms include any of {guest_bath, secondary_bath, kids_bath, powder}",
        },
        {
          title: "Bedrooms",
          bullets: [
            "Bedrooms are individually modest, but several together can meaningfully impact total finish investment (lighting, paint, furnishings).",
          ],
          visibilityCondition:
            "rooms include any of {primary_bedroom, nursery_bedroom, child_bedroom, teen_bedroom}",
        },
        {
          title: "Outdoor / patio",
          bullets: [
            "Outdoor finishes often require durable materials and specialty installation, which can rival interior rooms.",
          ],
          visibilityCondition: "rooms include any of {outdoor}",
        },
      ],
    },
  ],

  disclaimer: {
    patternId: "directional_guidance",
  },
};
