export type RuleBadgeTone = "positive" | "warning" | "neutral";

export type RuleBadge = {
  tone: RuleBadgeTone;
  icon: "check" | "warning" | "info";
  title: string;
  text: string;
};

export type RuleSection = {
  id: string;
  title: string;
  whyThisMatters?: string;
  subsections?: Array<{
    title: string;
    bullets: string[];
 visibilityCondition?: string; 
  }>;
  advisory?: string;
};
export type RuleDisclaimer = {
  patternId: string;
};

export type RevyRule = {
  id: string;
  name: string;
  category: string;
  triggerLogic: string;
  primaryRecommendation: string;

  // ✅ NEW: show user why this rule appeared (V1: can be generic text)
  whyShowing?: string;

  // ✅ NEW: optional reassurance when scope is light
  lightScopeNote?: string;

  badges: RuleBadge[];
  alwaysVisibleConstraints?: string[];
  sections?: RuleSection[];
 disclaimer?: RuleDisclaimer; // ✅ add this
};
