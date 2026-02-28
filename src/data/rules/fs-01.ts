import type { RevyRule } from "@/types/rules";

export const FS_01: RevyRule = {
  id: "FS-01",
  name: "Living-in-Home Constraints Affect Construction Feasibility",
  category: "Feasibility · Sequencing · Liveability Risk",

  /**
   * Evaluator-safe (no parentheses):
   * Equivalent intent:
   * (occupancy = full_time OR occupancy = living_unsure)
   * AND
   * (scope_level = full OR scope_level = new_build OR rooms include kitchen OR rooms include bathroom)
   */
  triggerLogic: `
occupancy = full_time AND scope_level = full
OR occupancy = full_time AND scope_level = new_build
OR occupancy = full_time AND rooms include kitchen
OR occupancy = full_time AND rooms include bathroom
OR occupancy = living_unsure AND scope_level = full
OR occupancy = living_unsure AND scope_level = new_build
OR occupancy = living_unsure AND rooms include kitchen
OR occupancy = living_unsure AND rooms include bathroom
  `.trim().replace(/\s+/g, " "),

  primaryRecommendation:
    "Phased construction with at least one fully usable daily-living area maintained throughout the project.",

  whyShowing:
    "This is showing up because you indicated you may be living in the home during the project. For new builds, full-time occupancy during construction is typically not feasible and often requires temporary relocation.",

  lightScopeNote:
    "For renovations with limited demolition, these constraints may be lower impact. For new builds or major structural work, living in the home during construction is rarely practical.",

  badges: [
    {
      tone: "positive",
      icon: "check",
      title: "Cost/Convenience Upside",
      text:
        "Living in the home can reduce costs by avoiding temporary rent and/or double-carrying housing expenses — with added planning and disruption tolerance.",
    },
    {
      tone: "warning",
      icon: "warning",
      title: "Higher Disruption Risk",
      text:
        "When living in the home, sequencing is more restrictive and timelines may extend.",
    },
  ],

  alwaysVisibleConstraints: [
    "Kitchen and bathroom access must be maintained",
    "Utilities may require temporary shutoffs",
    "Construction sequencing will be more restrictive",
  
  ],

  sections: [
    {
      id: "sequencing",
      title: "Construction Sequencing",
      whyThisMatters:
        "Living in the home limits demolition overlap and increases coordination complexity.",
      subsections: [
        {
          title: "Guidance",
          bullets: [
  
            "Avoid demolishing the kitchen and all bathrooms at the same time",
            "Ensure at least one bathroom remains usable at all times",
            "Expect longer timelines due to phased trade work",
          ],
        },
        {
          title: "Considerations",
          bullets: [
            "Some efficiencies are lost when work cannot overlap",
            "Phasing reduces disruption but increases duration",
          ],
        },
      ],
    },
    {
      id: "kitchen-bath",
      title: "Kitchen & Bathroom Viability",
      subsections: [
        {
          title: "Kitchen",
          bullets: [
            "If the kitchen must remain usable: avoid relocating sinks, gas lines, or major appliances",
            "If layout changes are required: plan a temporary, limited-use kitchen (sink + refrigerator + microwave/countertop oven)",
          ],
        },
        {
          title: "Bathroom",
          bullets: [
            "Maintain at least one fully functioning bathroom",
            "Sequence bathroom demolition, not simultaneous",
          ],
        },
      ],
      advisory:
        "Loss of kitchen or bathroom access is commonly cited as a major source of renovation stress and schedule friction when living in the home.",
    },
    {
      id: "utilities",
      title: "Utilities & Shutoffs",
      subsections: [
        {
          title: "Potential Red Flags",
          bullets: [
            "Electrical panel upgrades",
            "Whole-home rewiring",
            "Major plumbing replacement",
            "Gas line relocation or replacement",
          ],
        },
        {
          title: "Guidance",
          bullets: [
            "Some utility work requires extended shutoffs",
            "Full-time occupancy may not be feasible during these phases",
            "Utility upgrades are often best completed early in the project",
          ],
        },
      ],
    },
    {
      id: "environmental",
      title: "Environmental & Health Risks",
      subsections: [
        {
          title: "Potential Risk Indicators",
          bullets: [
            "Older homes",
            "Heavy demolition (tile, plaster, drywall)",
            "Known or suspected lead-based paint",
            "Known or suspected asbestos-containing materials",
            "Mold or moisture intrusion",
          ],
        },
        
        {
          title: "Guidance",
          bullets: [
            "Environmental testing or remediation may be required once walls/floors are opened",
            "Living in the home during remediation phases may not be advisable",
            "Air containment and HVAC isolation are critical",
          ],
        },
      ],
      advisory:
        "Environmental hazards such as lead, asbestos, or mold often emerge mid-project and can materially change scope, timeline, and liveability.",
    },
    {
      id: "noise",
      title: "Noise, Routine & Quiet Needs",
      subsections: [
        {
          title: "Potential Impact Factors",
          bullets: [
            "Work-from-home schedules",
            "Small children (including naps/daytime routines)",
            "Elderly residents at home during the day",
            "Pets sensitive to noise or disruption",
            "Quiet requirements during daytime hours",
          ],
        },
        {
          title: "Guidance",
          bullets: [
            "Expect periods of sustained noise during drilling, framing, tile, and concrete work",
            "Quiet-hour constraints may extend timelines",
            "Temporary relocation during peak noise phases can reduce stress",
          ],
        },
      ],
    },
    {
      id: "safety",
      title: "Children, Elderly & Pet Safety",
      subsections: [
        {
          title: "Risk Indicators",
          bullets: [
            "Children under 6",
            "Elderly residents",
            "Indoor or indoor/outdoor pets",
          ],
        },
        {
          title: "Guidance",
          bullets: [
            "Construction zones introduce trip hazards, exposed wiring, and noise stress",
            "Some phases (demolition, utility work, remediation) may not be appropriate for full-time occupancy",
            "Temporary relocation during high-risk phases is often the least disruptive option",
          ],
        },
      ],
    },
    {
      id: "storage-fatigue",
      title: "Storage, Disruption & Decision Fatigue",
      subsections: [
        {
          title: "Common Reality",
          bullets: [
            "Storage and usable space are lost early and restored late",
            "Daily routines take longer and require workarounds",
          ],
        },
        {
          title: "Guidance",
          bullets: [
            "Plan for displaced belongings (garage reorg, pod, or off-site storage)",
            "Lock design decisions early",
            "Avoid mid-project changes when possible",
          ],
        },
      ],
      advisory:
        "Living in an active construction environment increases decision fatigue and makes late-stage changes harder and more stressful.",
    },
  ],
};
