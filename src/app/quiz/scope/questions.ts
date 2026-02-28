// src/app/quiz/scope/questions.ts
// Project scope questions (Step 1)

import type { Question } from "@/questions";

/** Bathroom tub/shower configuration: used by CD (slots) and Studio Coordinator (moodboard layout). */
export type BathroomConfigId =
  | "shower_only"
  | "tub_and_shower_combined"
  | "tub_and_shower_separate";

/** Answer key for each bathroom room's config. Read as answers[bathroomConfigKey(roomId)]. */
export function bathroomConfigKey(roomId: string): string {
  return `bathroom_config_${roomId}`;
}

/** Answer key for each bathroom room's custom names. answers[bathroomNamesKey(roomId)] = string[] (one per instance). */
export function bathroomNamesKey(roomId: string): string {
  return `bathroom_names_${roomId}`;
}

/** Answer key for each room's custom names (all room types). answers[roomNamesKey(roomId)] = string[] (one per instance). */
export function roomNamesKey(roomId: string): string {
  return `room_names_${roomId}`;
}

/** Room IDs that are bathrooms and require tub/shower setup. Used for bathroom config questions. */
export const BATHROOM_ROOM_IDS = [
  "primary_bath",
  "guest_bath",
  "powder",
  "secondary_bath",
  "kids_bath",
] as const;

/** All room option IDs that support a quantity (multiple instances). When multiple are added, each must be named. */
export const COUNTABLE_OPTION_IDS = [
  "entry",
  "living",
  "family",
  "dining",
  "kitchen",
  "laundry",
  "office",
  "primary_bath",
  "guest_bath",
  "powder",
  "secondary_bath",
  "kids_bath",
  "primary_bedroom",
  "nursery_bedroom",
  "child_bedroom",
  "teen_bedroom",
  "outdoor",
] as const;

/** Labels for room options; used in "Name each room" step. */
export const ROOM_OPTION_LABELS: Record<string, string> = {
  entry: "Entry / foyer",
  living: "Living room",
  family: "Family / TV room",
  dining: "Dining room",
  kitchen: "Kitchen",
  laundry: "Laundry",
  office: "Home Office",
  primary_bath: "Primary bathroom",
  guest_bath: "Guest bathroom",
  powder: "Powder bathroom",
  secondary_bath: "Secondary bathroom",
  kids_bath: "Kids bathroom",
  primary_bedroom: "Primary bedroom",
  nursery_bedroom: "Kids bedroom (Nursery)",
  child_bedroom: "Kids bedroom (Child)",
  teen_bedroom: "Kids bedroom (Teen)",
  outdoor: "Outdoor / patio",
};

const ROOMS_ANSWER_KEY = "rooms";

function roomsIncludes(answers: Record<string, string[]>, roomId: string): boolean {
  return (answers[ROOMS_ANSWER_KEY] ?? []).includes(roomId);
}

function hasAnyRoomSelectedForNaming(answers: Record<string, string[]>): boolean {
  return (answers[ROOMS_ANSWER_KEY] ?? []).length > 0;
}

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

    supportsCounts: true,
    countableOptionIds: [...COUNTABLE_OPTION_IDS],

    options: [
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
    id: "room_names",
    title: "Name each space",
    subtitle:
      "Give each space a name so you can tell them apart in your moodboards and recommendations. Enter a name for every room you added (e.g. Master Bath, Main Kitchen, Guest Bedroom 1).",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    showIf: (answers) => hasAnyRoomSelectedForNaming(answers as Record<string, string[]>),
    options: [], // Rendered as custom text inputs in scope page
  },

  {
    id: bathroomConfigKey("primary_bath"),
    title: "What’s the setup in your primary bathroom?",
    subtitle: "This determines which products we recommend (shower tile, alcove tub, or stand-alone tub) and which layout we use.",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    showIf: (answers) => roomsIncludes(answers as Record<string, string[]>, "primary_bath"),
    options: [
      { id: "shower_only", label: "Shower only" },
      { id: "tub_and_shower_combined", label: "Combined shower and tub (alcove)" },
      { id: "tub_and_shower_separate", label: "Separate shower and stand-alone tub" },
    ],
  },
  {
    id: bathroomConfigKey("guest_bath"),
    title: "What’s the setup in your guest bathroom?",
    subtitle: "This determines which products we recommend and which layout we use.",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    showIf: (answers) => roomsIncludes(answers as Record<string, string[]>, "guest_bath"),
    options: [
      { id: "shower_only", label: "Shower only" },
      { id: "tub_and_shower_combined", label: "Combined shower and tub (alcove)" },
      { id: "tub_and_shower_separate", label: "Separate shower and stand-alone tub" },
    ],
  },
  {
    id: bathroomConfigKey("secondary_bath"),
    title: "What’s the setup in your secondary bathroom?",
    subtitle: "e.g. Hallway bathroom / shared use. This determines which products and layout we use.",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    showIf: (answers) => roomsIncludes(answers as Record<string, string[]>, "secondary_bath"),
    options: [
      { id: "shower_only", label: "Shower only" },
      { id: "tub_and_shower_combined", label: "Combined shower and tub (alcove)" },
      { id: "tub_and_shower_separate", label: "Separate shower and stand-alone tub" },
    ],
  },
  {
    id: bathroomConfigKey("kids_bath"),
    title: "What’s the setup in your kids bathroom?",
    subtitle: "This determines which products we recommend and which layout we use.",
    type: "single-image",
    allowMultiple: false,
    layout: "stack",
    required: true,
    showIf: (answers) => roomsIncludes(answers as Record<string, string[]>, "kids_bath"),
    options: [
      { id: "shower_only", label: "Shower only" },
      { id: "tub_and_shower_combined", label: "Combined shower and tub (alcove)" },
      { id: "tub_and_shower_separate", label: "Separate shower and stand-alone tub" },
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
