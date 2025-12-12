export type QuestionType = "multi-image" | "single-image";

export interface Option {
  id: string;
  label: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface Question {
  id: string;
  index: number;
  title: string;
  subtitle?: string;
  type: QuestionType;
  options: Option[];
  allowMultiple: boolean;
}

export const QUESTIONS: Question[] = [
  // Q1 – Usage: primary user
  {
    id: "bathroom_primary_user",
    index: 1,
    title: "Who will primarily use this bathroom?",
    type: "single-image",
    allowMultiple: false,
    options: [
      { id: "guest", label: "Guestroom Bath" },
      { id: "primary", label: "Primary Bath" },
      { id: "children", label: "Kid's Bathroom (Children)" },
      { id: "teens", label: "Kid's Bathroom (Teenagers)" },
      { id: "powder", label: "Powder Bath (All house use)" },
    ],
  },

  // Q2 – Usage: vanity type
  {
    id: "bathroom_vanity_type",
    index: 2,
    title: "Would you like a single vanity or double vanity (1 or 2 sinks)?",
    type: "single-image",
    allowMultiple: false,
    options: [
      { id: "single", label: "Single Vanity" },
      { id: "double", label: "Double Vanity" },
    ],
  },

  // Q3 – Usage: shower / tub / both
  {
    id: "bathroom_bathing_type",
    index: 3,
    title: "Would you like a shower, tub, or both?",
    type: "single-image",
    allowMultiple: false,
    options: [
      { id: "shower", label: "Shower" },
      { id: "tub", label: "Tub" },
      { id: "both", label: "Both" },
    ],
  },

  // Q4 – 27 images (was Q1)
  {
    id: "spaces_appeal",
    index: 4,
    title: "Which of these spaces appeal to you?",
    subtitle: "Select as many as you like. Scroll to see more.",
    type: "multi-image",
    allowMultiple: true,




  options: Array.from({ length: 27 }).map((_, i) => {
      const index = i + 1;
      const id = `space_${String(index).padStart(2, "0")}`;
      return {
        id,
        label: `Space ${index}`, // satisfies Option.label and is useful for accessibility
        imageUrl: `/quiz/q1/${id}.png`,
      };
    }),
},








  // Q5 – 3 images (was Q2)
  {
    id: "space_home",
    index: 5,
    title: "Which space feels most like home?",
    subtitle: "Choose the one that feels the most like you.",
    type: "single-image",
    allowMultiple: false,
    options: [
      {
        id: "home_01",
        label: "Refined & Elegant",
        imageUrl: "/quiz/q2/home-01.png",
      },
      {
        id: "home_02",
        label: "Cozy & Lived-in",
        imageUrl: "/quiz/q2/home-02.png",
      },
      {
        id: "home_03",
        label: "Sun-kissed & Relaxed",
        imageUrl: "/quiz/q2/home-03.png",
      },
    ],
  },

  // Q6 – 3 images (was Q3)
  {
    id: "light_color",
    index: 6,
    title: "What kind of light and color balance do you prefer?",
    subtitle: "Think about what inspires you or makes you feel at home.",
    type: "single-image",
    allowMultiple: false,
    options: [
      {
        id: "light_01",
        label: "Bright & Airy",
        imageUrl: "/quiz/q3/light-01.png",
      },
      {
        id: "light_02",
        label: "Balanced with Contrast",
        imageUrl: "/quiz/q3/light-02.png",
      },
      {
        id: "light_03",
        label: "Moody & Dramatic",
        imageUrl: "/quiz/q3/light-03.png",
      },
    ],
  },

  // Q7 – 3 images (was Q4)
  {
    id: "vacation_setting",
    index: 7,
    title: "Pick a favorite vacation setting",
    subtitle: "Where do you feel most alive?",
    type: "single-image",
    allowMultiple: false,
    options: [
      {
        id: "vacation_01",
        label: "Paris city immersion",
        imageUrl: "/quiz/q4/vacation-01.png",
      },
      {
        id: "vacation_02",
        label: "Provincial countryside retreat",
        imageUrl: "/quiz/q4/vacation-02.png",
      },
      {
        id: "vacation_03",
        label: "Mediterranean seaside escape",
        imageUrl: "/quiz/q4/vacation-03.png",
      },
    ],
  },

  // Q8 – material palette (3 images) (was Q5)
  {
    id: "material_palette",
    index: 8,
    title: "What is your ideal material palette?",
    subtitle: "Choose the mix that feels most right.",
    type: "single-image",
    allowMultiple: false,
    options: [
      {
        id: "material-01",
        label: "Polished & Modern",
        imageUrl: "/quiz/q5/material-01.png",
      },
      {
        id: "material-02",
        label: "Crisp & Natural",
        imageUrl: "/quiz/q5/material-02.png",
      },
      {
        id: "material-03",
        label: "Textured & Vintage",
        imageUrl: "/quiz/q5/material-03.png",
      },
    ],
  },

  // Q9 – how space should feel (3 images) (was Q6)
  {
    id: "space_feel",
    index: 9,
    title: "How should a space feel?",
    subtitle: "Follow your instinct.",
    type: "single-image",
    allowMultiple: false,
    options: [
      {
        id: "feel-01",
        label: "Minimal",
        imageUrl: "/quiz/q6/feel-01.png",
      },
      {
        id: "feel-02",
        label: "Curated",
        imageUrl: "/quiz/q6/feel-02.png",
      },
      {
        id: "feel-03",
        label: "Layered",
        imageUrl: "/quiz/q6/feel-03.png",
      },
    ],
  },

  // Q10 – favorite textures (3 images) (was Q7)
  {
    id: "textures",
    index: 10,
    title: "Pick your favorite textures",
    subtitle: "Choose what you want to feel around you.",
    type: "single-image",
    allowMultiple: false,
    options: [
      {
        id: "texture_01",
        label: "Elegant & Formal",
        imageUrl: "/quiz/q7/texture_03.png",
      },
      {
        id: "texture_02",
        label: "Organic & Unrefined",
        imageUrl: "/quiz/q7/texture_02.png",
      },
      {
        id: "texture_03",
        label: "Tactile & Eclectic",
        imageUrl: "/quiz/q7/texture_01.png",
      },
    ],
  },

  // Q11 – color mood (3–4 images) (was Q8)
  {
    id: "color_mood",
    index: 11,
    title: "What’s your ideal color mood?",
    subtitle: "Choose the palette you're most drawn to.",
    type: "single-image",
    allowMultiple: false,
    options: [
      {
        id: "mood-01",
        label: "Soft Neutrals & Warm Whites",
        imageUrl: "/quiz/q8/mood-01.png",
      },
      {
        id: "mood-02",
        label: "Neutral with High Contrast",
        imageUrl: "/quiz/q8/mood-02.png",
      },
      {
        id: "mood-03",
        label: "Deep Jewel Tones",
        imageUrl: "/quiz/q8/mood-03.png",
      },
      {
        id: "mood-04",
        label: "Dramatic & Moody",
        imageUrl: "/quiz/q8/mood-04.png",
      },
    ],
  },
];
