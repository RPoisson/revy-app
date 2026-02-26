import type { RevyRule } from "@/types/rules";

export const BU_03: RevyRule = {
  id: "BU-03",
  name: "Budget Guardrail: Plan for Surprises",
  category: "Budget · Risk",

  // Hidden for light_refresh (cosmetic) only; show when scope is partial/full and includes demo-heavy rooms
  triggerLogic:
    "scope_level != light_refresh AND rooms include whole_home OR scope_level != light_refresh AND rooms include kitchen OR scope_level != light_refresh AND rooms include laundry OR scope_level != light_refresh AND rooms include primary_bath OR scope_level != light_refresh AND rooms include guest_bath OR scope_level != light_refresh AND rooms include secondary_bath OR scope_level != light_refresh AND rooms include powder OR scope_level != light_refresh AND rooms include kids_bath",

  primaryRecommendation:
    "Plan for some flexibility in your budget—projects that open walls or touch kitchens, baths, or utilities often uncover conditions that aren’t visible upfront.",

  whyShowing:
    "This appears because your scope goes beyond a cosmetic refresh and includes areas where hidden conditions, system upgrades, or inspection requirements commonly surface once work begins.",

  badges: [
    {
      tone: "warning",
      icon: "warning",
      title: "Surprises tend to show up during demo",
      text:
        "Once walls and floors are opened, issues affecting cost and schedule are more likely to appear.",
    },
  ],

  alwaysVisibleConstraints: [
    "Hidden conditions are often discovered after demolition begins",
    "System upgrades can be required once existing conditions are exposed",
    "Inspection outcomes may add scope on permitted projects",
    "Late changes increase cost and disrupt timelines",
  ],

  sections: [
    {
      id: "common-risks",
      title: "Where budget surprises usually come from",
      subsections: [
        {
          title: "Demo-heavy areas (kitchens, baths, laundry, whole-home)",
          bullets: [
            "Substrate repairs (rot, uneven floors, cracked slabs)",
            "Waterproofing corrections or upgrades",
            "Framing adjustments for layouts, niches, or recessed elements",
            "Plumbing or vent routing conflicts",
          ],
        },
        {
          title: "Remodel-related system upgrades",
          bullets: [
            "Plumbing updates (aging supply lines, drains, venting, shutoffs)",
            "Electrical rework (panel capacity, grounding, GFCI/AFCI requirements)",
            "Moisture damage or mold remediation uncovered during demo",
            "Lead or asbestos handling depending on age and materials",
          ],
        },
        {
          title: "Permits and compliance (when applicable)",
          bullets: [
            "Permit and plan-check fees or re-submittals",
            "Inspection corrections that add required scope",
            "Energy efficiency requirements (insulation, ventilation, equipment standards)",
            "Earthquake or seismic retrofit requirements (bolting, bracing, shear, foundation work)",
            "Fire-life-safety requirements depending on jurisdiction",
          ],
          visibilityCondition:
            "permit_requirement != no_permit",
        },
      ],
    },

    {
      id: "reduce-risk",
      title: "How to reduce surprise-driven overruns",
      subsections: [
        {
          title: "Guidance",
          bullets: [
            "Expect most discoveries during demo and early rough-ins—this is normal",
            "Make plumbing, electrical, and structural allowances explicit in your contract with your builder, rather than buried",
            "Lock key decisions early (fixtures, appliances, cabinetry, tile)",
            "Avoid late-stage changes once procurement or rough-ins have begun",
          ],
        },
      ],
    },

    {
      id: "reassurance",
      title: "Why this matters",
      subsections: [
        {
          title: "Planning, not pessimism",
          bullets: [
            "Planning for surprises doesn’t mean your project will go over budget—it means you’re prepared if something unexpected appears.",
            "Projects that acknowledge risk early tend to make calmer, faster decisions when issues arise.",
          ],
        },
      ],
    },
  ],

  disclaimer: {
    patternId: "directional_guidance",
  },
};
