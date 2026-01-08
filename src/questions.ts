// src/questions.ts (or wherever "@/questions" points)

import { shouldShowSpace, isArchetypeSupported } from "@/app/quiz/logic";


export type QuestionType = "multi-image" | "single-image";
export type QuestionLayout = "stack" | "grid";

export interface Option {
  id: string;
  label: string;
  subtitle?: string;
  imageUrl?: string;

  // for conditional options (Step 3)
  showIf?: (answers: Record<string, string[]>) => boolean;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  type: QuestionType;
  options: Option[];
  allowMultiple: boolean;

  // UI control
  layout?: QuestionLayout;

  // conditional display (Step 3 - future)
  showIf?: (answers: Record<string, string[]>) => boolean;

  // required gating
  required?: boolean;
}

export const QUESTIONS: Question[] = [
  // Q1 – Exterior / architectural style
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
      // NOTE: this path looks like a typo in your file ("Cictorian.jpg"). Leaving as-is so it matches your current repo.
      // If the image doesn't render, rename to Victorian.jpg and update this path.
      { id: "victorian", label: "Victorian", imageUrl: "/quiz/exterior/Victorian.jpg" },
    ],
  },

  // Q2 – Spaces that appeal (27-image multi-select, filtered by supported archetypes)
  {
    id: "spaces_appeal",
    title: "Which of these spaces appeal to you?",
    subtitle: "Select as many as you like. Scroll to see more.",
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

  // Q3 – Space that feels like home
{
  id: "space_home",
  title: "Which space feels most like home?",
  subtitle: "Choose the one that feels the most like you.",
  type: "single-image",
  allowMultiple: false,
  options: [
    {
      id: "home_01",
      label: "Refined & Elegant",
      imageUrl: "/quiz/q2/home_01.jpg",
      showIf: (answers) => isArchetypeSupported(answers, "parisian"),
    },
    {
      id: "home_02",
      label: "Cozy & Lived-in",
      imageUrl: "/quiz/q2/home_02.jpg",
      showIf: (answers) => isArchetypeSupported(answers, "provincial"),
    },
    {
      id: "home_03",
      label: "Sun-kissed & Relaxed",
      imageUrl: "/quiz/q2/home_03.jpg",
      showIf: (answers) => isArchetypeSupported(answers, "mediterranean"),
    },
  ],
},

  // Q4 – Light & color balance
  {
    id: "light_color",
    title: "What kind of light and color balance do you prefer?",
    subtitle: "Think about what inspires you or makes you feel at home.",
    type: "single-image",
    allowMultiple: false,
    options: [
      { id: "light_01", label: "Bright & Airy", imageUrl: "/quiz/q3/light-01.jpg" },
      { id: "light_02", label: "Balanced with Contrast", imageUrl: "/quiz/q3/light-02.jpg" },
      { id: "light_03", label: "Moody & Dramatic", imageUrl: "/quiz/q3/light-03.jpg" },
    ],
  },

  // Q5 – Material palette
  {
    id: "material_palette",
    title: "What materials and textures do you prefer?",
    subtitle: "Choose the mix that feels most right.",
    type: "single-image",
    allowMultiple: false,
    options: [
      { id: "material-01", label: "Polished & Modern", imageUrl: "/quiz/q5/material-01.jpg" },
      { id: "material-02", label: "Crisp & Natural", imageUrl: "/quiz/q5/material-02.jpg" },
      { id: "material-03", label: "Textured & Vintage", imageUrl: "/quiz/q5/material-03.jpg" },
    ],
  },

  // Q6 – How space should feel
  {
    id: "space_feel",
    title: "How should a space feel?",
    subtitle: "Follow your instinct.",
    type: "single-image",
    allowMultiple: false,
    options: [
      { id: "feel-01", label: "Minimal", imageUrl: "/quiz/q6/feel-01.jpg" },
      { id: "feel-02", label: "Curated", imageUrl: "/quiz/q6/feel-02.jpg" },
      { id: "feel-03", label: "Layered", imageUrl: "/quiz/q6/feel-03.jpg" },
    ],
  },

  // Q7 – Color mood
  {
    id: "color_mood",
    title: "What’s your ideal color mood?",
    subtitle: "Choose the palette you're most drawn to.",
    type: "single-image",
    allowMultiple: false,
    options: [
      { id: "mood-01", label: "Soft Neutrals & Warm Whites", imageUrl: "/quiz/q8/mood-01.jpg" },
      { id: "mood-02", label: "Neutral with High Contrast", imageUrl: "/quiz/q8/mood-02.jpg" },
      { id: "mood-03", label: "Deep Jewel Tones", imageUrl: "/quiz/q8/mood-03.jpg" },
      { id: "mood-04", label: "Dramatic & Moody", imageUrl: "/quiz/q8/mood-04.jpg" },
    ],
  },
];
