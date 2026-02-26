// src/app/quiz/scope/questions.ts
// Project scope questions (Step 1)

import type { Question } from "@/questions";

export const SCOPE_QUESTIONS: Question[] = [
  {
    id: "project_for",
    title: "Who is this home for?",
    subtitle:
      "This helps us tailor recommendations (what will drive value, durability, and ROI focus).",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    options: [
      { id: "personal_home", label: "Personal Residence (Primary or Secondary Home)" },
      { id: "investment_rental", label: "Investment Rental Property (Tenant-occupied / Not owner-occupied)" },
      { id: "immediate_flip", label: "Immediate Flip / Resale (Focus on market appeal and ROI)" },
    ],
  },

  {
    id: "occupancy",
    title: "Will you be living in the home during the project?",
    subtitle: "This changes what’s realistic for sequencing, disruption, and speed.",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    options: [
      { id: "full_time", label: "Yes" },
      { id: "not_living_there", label: "No" },
      { id: "living_unsure", label: "Not sure yet" },
    ],
  },

  {
    id: "start_timing",
    title: "When do you want to begin?",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    options: [
      { id: "asap", label: "ASAP" },
      { id: "1_3_months", label: "1–3 months" },
      { id: "3_6_months", label: "3–6 months" },
      { id: "6_12_months", label: "6–12 months" },
      { id: "not_sure", label: "Not sure yet" },
    ],
  },

  {
    id: "completion_timing",
    title: "When do you want to complete the project?",
    subtitle: "This reflects the timeline from when the project starts.",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    options: [
      { id: "1_3_months", label: "1–3 months" },
      { id: "3_6_months", label: "3–6 months" },
      { id: "6_12_months", label: "6–12 months" },
      { id: "12_plus_months", label: "12+ months" },
      { id: "not_sure", label: "Not sure yet" },
    ],
  },

  {
    id: "timeline_flexibility",
    title: "How flexible is your timeline?",
    subtitle:
      "This helps us decide which materials and fixtures we recommend, and if custom vs in-stock is realistic.",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    options: [
      { id: "fixed", label: "Fixed (date-driven)" },
      { id: "somewhat", label: "Somewhat flexible" },
      { id: "very", label: "Very flexible" },
    ],
  },

  //{
   // id: "permit_required",
   // title: "Do you plan to pull permits?",
   // subtitle: "This helps us provide guidance on potential constraints.",
   // type: "single-image",
   // allowMultiple: false,
   // layout: "stack",
   // required: true,
   // options: [
   //   { id: "no_permit", label: "No" },
    //  { id: "yes", label: "Yes" },
    //  { id: "yes_permit_received", label: "Yes (already in progress/received)" },
    //  { id: "permit_unsure", label: "Not sure yet" },
   // ],
 // },

 {
    id: "rooms",
    title: "Which spaces are you building or updating?",
    subtitle: "Choose all that apply.",
    type: "multi-image",
    allowMultiple: true,
    layout: "stack",
    required: true,

    // ✅ Cleaned up: No more 'as any' needed!
    supportsCounts: true,
    countableOptionIds: [
      "guest_bath",
      "powder",
      "secondary_bath",
      "kids_bath",
      "nursery_bedroom",
      "child_bedroom",
      "teen_bedroom",
    ],

    options: [
      { id: "whole_home", label: "Whole home" },
      { id: "entry", label: "Entry / foyer" },
      { id: "living", label: "Living room" },
      { id: "family", label: "Family / TV room" },
      { id: "dining", label: "Dining room" },
      { id: "kitchen", label: "Kitchen" },
      { id: "laundry", label: "Laundry" },
      { id: "office", label: "Home Office" },
      { id: "primary_bath", label: "Primary bathroom" },
      { id: "guest_bath", label: "Guest bathroom" },
      { id: "powder", label: "Powder bathroom" },
      { id: "secondary_bath", label: "Secondary bathroom (ex. Hallway bathroom/shared use)" },
      { id: "kids_bath", label: "Kids bathroom" },

      { id: "primary_bedroom", label: "Primary bedroom" },
      { id: "nursery_bedroom", label: "Kids bedroom (Nursery)" },
      { id: "child_bedroom", label: "Kids bedroom (Child)" },
      { id: "teen_bedroom", label: "Kids bedroom (Teen)" },
      { id: "outdoor", label: "Outdoor / patio" },
    ],
  },

  {
    id: "scope_level",
    title: "What best describes the level of work?",
    subtitle: "This helps us interpret budget ranges and feasibility.",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    options: [
      {
        id: "refresh",
        label: "Refresh (no floorplan/layout changes)",
        subtitle: "Paint, lighting, minor updates",
        tooltip:
          "Choose this for aesthetic updates only. No plumbing work is involved beyond perhaps a simple faucet swap.",
      },
      {
        id: "partial",
        label: "Partial renovation",
        subtitle: "Some construction / targeted rooms",
        tooltip:
          "Choose this if you are replacing fixtures (sinks, toilets) in their existing locations. Includes minor electrical and cabinetry adjustments.",
      },
      {
        id: "full",
        label: "Full renovation",
        subtitle: "Major construction and rework",
        tooltip:
          "Required if moving plumbing. Choose this if you are reconfiguring the layout, moving 'wet' lines (toilets/showers), or tearing walls down to the studs.",
      },
      {
        id: "new_build",
        label: "New build",
        subtitle: "Ground-up or major addition",
        tooltip:
          "Choose for ground-up construction or new additions requiring entirely new plumbing systems and tie-ins.",
      },
      { id: "not_sure", label: "Not sure yet" },
    ],
  },
];
