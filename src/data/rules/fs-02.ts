import type { RevyRule } from "@/types/rules";

export const FS_02: RevyRule = {
  id: "FS-02",
  name: "Lead-Time Sensitivity Affects Finish Selections",
  category: "Feasibility · Sequencing · Lead-Time Risk",
  triggerLogic:
    "(start_timing = asap OR timeline_flexibility = fixed) OR (lead_time_sensitivity = high)",

  primaryRecommendation:
    "Prioritize fast-ship, standard-dimension finishes and lock schedule-dependent selections early to reduce supply-chain risk.",

  whyShowing:
    "This is showing up because you indicated a near-term or fixed start and/or high sensitivity to delays.",

  badges: [
    {
      tone: "positive",
      icon: "check",
      title: "Schedule Protection",
      text:
        "Favoring readily available finishes helps prevent stalled labor and reduces timeline volatility.",
    },
    {
      tone: "warning",
      icon: "warning",
      title: "Lead-Time Risk",
      text:
        "Custom or long-lead items can delay rough-ins, inspections, and finish installation when timing is constrained.",
    },
  ],

  alwaysVisibleConstraints: [
    "Favor in-stock or fast-ship materials",
    "Prefer standard sizes and common rough-ins",
    "Confirm tolerance for substitutions if lead times slip",
    "Lock schedule-dependent finish decisions early",
  ],

  sections: [
    {
      id: "tier-overview",
      title: "Early Decision Tiers",
      whyThisMatters:
        "Some finish decisions directly affect rough-ins, inspections, or fabrication. Locking these early protects the construction schedule.",
      subsections: [
        {
          title: "🔴 Tier 1 — Must Lock Early",
          bullets: [
            "These items block progress if undecided",
            "Delays here can stop work entirely",
          ],
        },
        {
          title: "🟠 Tier 2 — Should Lock Early",
          bullets: [
            "These items affect sequencing and coordination",
            "Work can continue, but with higher risk",
          ],
        },
        {
          title: "🟢 Tier 3 — Can Decide Later",
          bullets: [
            "These items rarely block construction",
            "They can remain flexible with minimal schedule impact",
          ],
        },
      ],
    },

    {
      id: "tier-1",
      title: "🔴 Tier 1 — Must Lock Early",
      subsections: [
        {
          title: "Finish Decisions That Block Work",
          bullets: [
            // Plumbing-dependent (only relevant if plumbing rooms are in scope)
            "Plumbing fixtures (valves, tubs, toilets, faucet mounting types) — if any plumbing room is in scope",
            // Kitchen / laundry
            "Appliance models for kitchen or laundry (cabinetry, electrical, and venting depend on exact specs)",
            "Vent hoods and blower systems (ducting affects framing and ceilings)",
            // Exterior envelope
            "Windows (often long-lead; affect enclosure and interior sequencing)",
            "Exterior doors (dimension-specific and frequently backordered)",
            // Cabinetry
            "Custom or semi-custom cabinetry (fabrication lead time drives the critical path)",
          ],
        },
      ],
      advisory:
        "Tier 1 items behave like infrastructure. Even though they’re finishes, other work cannot proceed without them.",
    },

    {
      id: "tier-2",
      title: "🟠 Tier 2 — Should Lock Early",
      subsections: [
        {
          title: "Finish Decisions That Increase Risk If Delayed",
          bullets: [
            "Tile thickness and edge details (affect substrate prep and trim)",
            "Stone slab selections (availability can delay templating and install)",
            "Lighting layout and mounting types (finish fixtures can come later)",
            "Specialty finishes with known lead times",
          ],
        },
      ],
      advisory:
        "Delaying Tier 2 decisions rarely stops work immediately, but often causes rework, resequencing, or compromises.",
    },

    {
      id: "tier-3",
      title: "🟢 Tier 3 — Can Decide Later",
      subsections: [
        {
          title: "Low Schedule Impact Decisions",
          bullets: [
            "Final paint colors",
            "Decorative lighting finishes (if boxes and mounting are set)",
            "Cabinet hardware",
            "Accessory finishes and accents",
          ],
        },
      ],
      advisory:
        "Tier 3 decisions are visually important but rarely affect inspections or rough-ins.",
    },

    {
      id: "substitutions",
      title: "Substitutions & Flexibility",
      whyThisMatters:
        "Even quoted lead times can slip. Pre-approving substitution rules helps protect the schedule.",
      subsections: [
        {
          title: "Rêvy Guidance",
          bullets: [
            "Pre-approve substitutions with matching dimensions and mounting",
            "Avoid substitutions that change rough-ins or clearances",
            "Treat appliances, plumbing fixtures, and cabinetry as non-substitutable unless explicitly approved",
          ],
        },
      ],
    },
  ],
};
