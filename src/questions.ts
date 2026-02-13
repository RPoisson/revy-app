// src/questions.ts
import { shouldShowSpace, isArchetypeSupported } from "@/app/quiz/logic";

export type QuestionType = "multi-image" | "single-image";
export type QuestionLayout = "stack" | "grid";

type Answers = Record<string, string[]>;

export interface Option {
  id: string;
  label: string;
  subtitle?: string;
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
// Color mood gating helpers
// ──────────────────────────────────────────────────────────────

type Archetype = "parisian" | "provincial" | "mediterranean" | "unknown";

function selectedArchetypeFromAnswers(answers: Answers): Archetype {
  const selected = (answers["space_home"] ?? [])[0];
  if (selected === "home_01") return "parisian";
  if (selected === "home_02") return "provincial";
  if (selected === "home_03") return "mediterranean";
  return "unknown";
}

function exteriorFamilyFromAnswers(answers: Answers): "sunwashed" | "modern" | "heritage" | "classic" {
  const ext = ((answers["home_exterior_style"] ?? [])[0] ?? "").toLowerCase();
  if (["mediterranean_spanish", "ranch"].includes(ext)) return "sunwashed";
  if (["contemporary_modern", "midcentury_modern"].includes(ext)) return "modern";
  if (["victorian", "tudor_english_cottage", "craftsman"].includes(ext)) return "heritage";
  return "classic";
}

type PaletteId = "mood-01" | "mood-02" | "mood-03" | "mood-04" | "mood-05";

function supportedPalettesByArchetype(archetype: Archetype): Set<PaletteId> {
  switch (archetype) {
    case "parisian":
      return new Set<PaletteId>(["mood-01", "mood-02", "mood-03", "mood-04"]);
    case "provincial":
      return new Set<PaletteId>(["mood-01", "mood-02", "mood-04"]);
    case "mediterranean":
      return new Set<PaletteId>(["mood-01", "mood-03", "mood-05"]);
    default:
      return new Set<PaletteId>(["mood-01", "mood-02", "mood-03", "mood-04", "mood-05"]);
  }
}

function isPaletteDisallowedByExterior(paletteId: PaletteId, answers: Answers): boolean {
  const fam = exteriorFamilyFromAnswers(answers);
  if (fam === "sunwashed") {
    if (paletteId === "mood-02") return true;
    if (paletteId === "mood-04") return true;
  }
  return false;
}

function isPaletteSelectable(paletteId: PaletteId, answers: Answers): boolean {
  const archetype = selectedArchetypeFromAnswers(answers);
  const supported = supportedPalettesByArchetype(archetype).has(paletteId);
  if (!supported) return false;
  if (isPaletteDisallowedByExterior(paletteId, answers)) return false;
  return true;
}

function notBestFitReason(paletteId: PaletteId, answers: Answers): string {
  const fam = exteriorFamilyFromAnswers(answers);
  if (fam === "sunwashed") {
    if (paletteId === "mood-02") return "High contrast can read too sharp against a sun-washed exterior.";
    if (paletteId === "mood-04") return "A very moody palette can feel heavy in a sun-washed architectural context.";
  }
  return "Not the strongest fit for the home’s exterior character and the overall direction of this project.";
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
    options: [
      { id: "light_01", label: "Bright & Airy", imageUrl: "/quiz/q3/light-01.jpg" },
      { id: "light_02", label: "Balanced with Contrast", imageUrl: "/quiz/q3/light-02.jpg" },
      { id: "light_03", label: "Moody & Dramatic", imageUrl: "/quiz/q3/light-03.jpg" },
    ],
  },
  {
    id: "color_mood",
    title: "What’s your ideal color mood?",
    type: "single-image",
    allowMultiple: false,
    options: [
      {
        id: "mood-01",
        label: "Soft Neutrals & Warm Whites",
        imageUrl: "/quiz/q8/mood-01.jpg",
        disabledIf: (answers) => !isPaletteSelectable("mood-01", answers),
        disabledReason: (answers) => notBestFitReason("mood-01", answers),
      },
      {
        id: "mood-02",
        label: "Neutral with High Contrast",
        imageUrl: "/quiz/q8/mood-02.jpg",
        disabledIf: (answers) => !isPaletteSelectable("mood-02", answers),
        disabledReason: (answers) => notBestFitReason("mood-02", answers),
      },
      {
        id: "mood-03",
        label: "Deep Jewel Tones",
        imageUrl: "/quiz/q8/mood-03.jpg",
        disabledIf: (answers) => !isPaletteSelectable("mood-03", answers),
        disabledReason: (answers) => notBestFitReason("mood-03", answers),
      },
      {
        id: "mood-04",
        label: "Dramatic & Moody",
        imageUrl: "/quiz/q8/mood-04.jpg",
        disabledIf: (answers) => !isPaletteSelectable("mood-04", answers),
        disabledReason: (answers) => notBestFitReason("mood-04", answers),
      },
      {
        id: "mood-05",
        label: "Airy & Bright Naturals",
        imageUrl: "/quiz/q8/mood-05.jpg",
        disabledIf: (answers) => !isPaletteSelectable("mood-05", answers),
        disabledReason: (answers) => notBestFitReason("mood-05", answers),
      },
    ],
  },
];