// src/questions.ts (or wherever "@/questions" points)
// FCH aesthetic questions

import { shouldShowSpace, isArchetypeSupported } from "@/app/quiz/logic";

export type QuestionType = "multi-image" | "single-image";
export type QuestionLayout = "stack" | "grid";

type Answers = Record<string, string[]>;

export interface Option {
  id: string;
  label: string;
  subtitle?: string;
  imageUrl?: string;

  // for conditional options (Step 3)
  showIf?: (answers: Answers) => boolean;

  // NEW (optional): allow showing options that are visible but not selectable
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

  // UI control
  layout?: QuestionLayout;

  // conditional display (Step 3 - future)
  showIf?: (answers: Answers) => boolean;

  // required gating
  required?: boolean;

  // ✅ ADD THESE TWO LINES TO FIX THE BUILD ERROR
  supportsCounts?: boolean; 
  countableOptionIds?: string[];
}

// ... rest of your file (selectedArchetypeFromAnswers, QUESTIONS, etc.)