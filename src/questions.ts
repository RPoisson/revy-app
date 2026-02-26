// src/questions.ts
import { shouldShowSpace, isArchetypeSupported } from "@/app/quiz/logic";

export type QuestionType = "multi-image" | "single-image";
export type QuestionLayout = "stack" | "grid";

type Answers = Record<string, string[]>;

export interface Option {
  id: string;
  label: string;
  subtitle?: string;
  /** Optional tooltip shown on hover (desktop) or tap (mobile) */
  tooltip?: string;
  imageUrl?: string;
  showIf?: (answers: Answers) => boolean;
  disabledIf?: (answers: Answers) => boolean;
  disabledReason?: (answers: Answers) => string;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: QuestionType;
  options: Option[];
  allowMultiple: boolean;
  layout?: QuestionLayout;
  showIf?: (answers: Answers) => boolean;
  required?: boolean;
  // ✅ These fix the "property does not exist" build errors
  supportsCounts?: boolean; 
  countableOptionIds?: string[];
}

// ──────────────────────────────────────────────────────────────
// Color mood gating by light balance (defensive: never throw)
// ──────────────────────────────────────────────────────────────

function safeFirst(val: unknown): string | undefined {
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") return val[0];
  return undefined;
}

type PaletteId = "mood_01" | "mood_02" | "mood_03" | "mood_04" | "mood_05";

/** Color mood selectable by light balance: Bright & Airy → mood_01, mood_05; Balanced → mood_05, mood_02, mood_03; Moody → mood_03, mood_04 */
const MOODS_BY_LIGHT: Record<string, Set<PaletteId>> = {
  light_01: new Set<PaletteId>(["mood_01", "mood_05"]),
  light_02: new Set<PaletteId>(["mood_05", "mood_02", "mood_03"]),
  light_03: new Set<PaletteId>(["mood_03", "mood_04"]),
};

function isPaletteSelectableByLight(paletteId: PaletteId, answers: Answers): boolean {
  if (!answers || typeof answers !== "object") return true;
  const light = safeFirst(answers["light_color"]);
  if (!light) return true;
  return MOODS_BY_LIGHT[light]?.has(paletteId) ?? true;
}

function notBestFitReason(_paletteId: PaletteId, _answers: Answers): string {
  return ""; // not shown in UI for color_mood
}

// ──────────────────────────────────────────────────────────────
// Main Questions Data
// ──────────────────────────────────────────────────────────────

export const QUESTIONS: Question[] = [
  {
    id: "home_exterior_style",
    title: "What is the exterior / architectural style of the home?",
    subtitle: "Choose the closest match.",
    type: "single-image",
    allowMultiple: false,
    layout: "grid",
    required: true,
    options: [
      { id: "cape_cod", label: "Cape Cod", imageUrl: "/quiz/exterior/CapeCod.jpg" },
      { id: "colonial", label: "Colonial", imageUrl: "/quiz/exterior/Colonial.jpg" },
      { id: "contemporary_modern", label: "Contemporary Modern", imageUrl: "/quiz/exterior/ContemporaryModern.jpg" },
      { id: "craftsman", label: "Craftsman", imageUrl: "/quiz/exterior/Craftsman.jpg" },
      { id: "french_provincial", label: "French Provincial", imageUrl: "/quiz/exterior/FrenchProvincial.jpg" },
      { id: "mediterranean_spanish", label: "Mediterranean / Spanish", imageUrl: "/quiz/exterior/MediterraneanSpanish.jpg" },
      { id: "midcentury_modern", label: "Mid-Century Modern", imageUrl: "/quiz/exterior/MidCenturyModern.jpg" },
      { id: "modern_farmhouse", label: "Modern Farmhouse", imageUrl: "/quiz/exterior/ModernFarmhouse.jpg" },
      { id: "ranch", label: "Ranch", imageUrl: "/quiz/exterior/Ranch.jpg" },
      { id: "tudor_english_cottage", label: "Tudor / English Cottage", imageUrl: "/quiz/exterior/Tudor.jpg" },
      { id: "victorian", label: "Victorian", imageUrl: "/quiz/exterior/Victorian.jpg" },
    ],
  },
  {
    id: "spaces_appeal",
    title: "Which of these spaces appeal to you?",
    subtitle: "Select as many as you like.",
    type: "multi-image",
    allowMultiple: true,
required: true,
    layout: "grid",
    options: Array.from({ length: 27 }).map((_, i) => {
      const index = i + 1;
      const id = `space_${String(index).padStart(2, "0")}`;
      return {
        id,
        label: `Space ${index}`,
        imageUrl: `/quiz/q1/${id}.jpg`,
        showIf: (answers) => shouldShowSpace(id, answers),
      };
    }),
  },
  {
    id: "space_home",
    title: "Which of these do you prefer?",
    type: "single-image",
    allowMultiple: false,
required: true,
    options: [
      { id: "home_01", label: "Refined & Elegant", imageUrl: "/quiz/q2/home_01.jpg", showIf: (answers) => isArchetypeSupported(answers, "parisian") },
      { id: "home_02", label: "Cozy & Lived-in", imageUrl: "/quiz/q2/home_02.jpg", showIf: (answers) => isArchetypeSupported(answers, "provincial") },
      { id: "home_03", label: "Sun-kissed & Relaxed", imageUrl: "/quiz/q2/home_03.jpg", showIf: (answers) => isArchetypeSupported(answers, "mediterranean") },
    ],
  },
  {
    id: "light_color",
    title: "What kind of light and color balance do you prefer?",
    type: "single-image",
    allowMultiple: false,
required: true,
    options: [
      { id: "light_01", label: "Bright & Airy", imageUrl: "/quiz/q3/light_01.jpg" },
      { id: "light_02", label: "Balanced with Contrast", imageUrl: "/quiz/q3/light_02.jpg" },
      { id: "light_03", label: "Moody & Dramatic", imageUrl: "/quiz/q3/light_03.jpg" },
    ],
  },

{
    id: "material_palette",
    title: "Which material palette resonates with you?",
    type: "single-image",
    allowMultiple: false,
    required: true,
    options: [
      { id: "material_01", label: "Smooth & Polished", imageUrl: "/quiz/q5/material_01.jpg" },
      { id: "material_02", label: "Mixed Textures", imageUrl: "/quiz/q5/material_02.jpg" },
      { id: "material_03", label: "Raw & Organic", imageUrl: "/quiz/q5/material_03.jpg" },
    ],
  },
  {
    id: "space_feel",
    title: "How should the space feel?",
    type: "single-image",
    allowMultiple: false,
    required: true,
    options: [
      { id: "feel_01", label: "Clean & Streamlined", imageUrl: "/quiz/q6/feel_01.jpg" },
      { id: "feel_02", label: "Balanced & Comfortable", imageUrl: "/quiz/q6/feel_02.jpg" },
      { id: "feel_03", label: "Layered & Collected", imageUrl: "/quiz/q6/feel_03.jpg" },
    ],
  },


  {
    id: "color_mood",
    title: "What’s your ideal color mood?",
    type: "single-image",
    allowMultiple: false,
required: true,
    options: [
      {
        id: "mood_01",
        label: "Soft Neutrals & Warm Whites",
        imageUrl: "/quiz/q8/mood_01.jpg",
        disabledIf: (answers) => !isPaletteSelectableByLight("mood_01", answers),
        disabledReason: (answers) => notBestFitReason("mood_01", answers),
      },
      {
        id: "mood_02",
        label: "High Contrast Neutrals (Cream, Charcoal, Navy)",
        imageUrl: "/quiz/q8/mood_02.jpg",
        disabledIf: (answers) => !isPaletteSelectableByLight("mood_02", answers),
        disabledReason: (answers) => notBestFitReason("mood_02", answers),
      },
      {
        id: "mood_03",
        label: "Jewel Tones (Green, Teal, Burgundy, Navy)",
        imageUrl: "/quiz/q8/mood_03.jpg",
        disabledIf: (answers) => !isPaletteSelectableByLight("mood_03", answers),
        disabledReason: (answers) => notBestFitReason("mood_03", answers),
      },
      {
        id: "mood_04",
        label: "Deep Muted Colors (Plum, Charcoal, Green, Brown)",
        imageUrl: "/quiz/q8/mood_04.jpg",
        disabledIf: (answers) => !isPaletteSelectableByLight("mood_04", answers),
        disabledReason: (answers) => notBestFitReason("mood_04", answers),
      },
      {
        id: "mood_05",
        label: "Nature-inspired (Cream, Blue, Green)",
        imageUrl: "/quiz/q8/mood_05.jpg",
        disabledIf: (answers) => !isPaletteSelectableByLight("mood_05", answers),
        disabledReason: (answers) => notBestFitReason("mood_05", answers),
      },
    ],
  },
];