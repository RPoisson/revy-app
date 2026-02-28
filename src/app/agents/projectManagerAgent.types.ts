// src/app/agents/projectManagerAgent.types.ts
// Types for the Project Manager (PM) Agent — fiscal, maintenance, and technical auditor.
// Aligned with budgetHeuristics, questions.ts, and answersStore.

import type { QuizAnswers } from "@/app/quiz/lib/answersStore";
import type { BudgetFit } from "@/app/brief/budgetHeuristics";

/** Finish tier from budget questions (builder_plus = Value, mid = Elevated, high = Luxury). */
export type FinishTierId = "builder_plus" | "mid" | "high";

/** Project-for context: personal_home | investment_rental | immediate_flip */
export type ProjectForId = "personal_home" | "investment_rental" | "immediate_flip";

/** Material tier for fiscal swap (Luxury → Value/Elevated when mismatch). */
export type MaterialTier = "Value" | "Elevated" | "Luxury";

/** One proposed or audited material slot (from Creative Director output). */
export interface ProposedMaterial {
  /** Stable material/slot id (e.g. stone.calacatta_lux_quartzite, flooring.marble_basketweave). */
  id: string;
  /** Slot/category (e.g. countertop, tile_floor, lighting). */
  slotId: string;
  /** Room this applies to (e.g. kitchen, primary_bath). */
  roomId?: string;
  /** Tier of this material for fiscal audit. */
  tier?: MaterialTier;
  /** Raw material/finish tags for maintenance and finish-tier rules (e.g. marble, unlacquered, plaster). */
  materialTags?: string[];
  /** Fixture type for 36-inch rule: "sconce" | "overhead" | etc. */
  fixtureType?: "sconce" | "overhead" | "other";
  /**
   * Human-readable scope/finish reasoning for the Decision Details table "Scope" column.
   * Set by PM agent; Studio Coordinator renders this only (no rule IDs or rule UI).
   */
  scopeReasoning?: string;
}

/**
 * Dimensions context for a room. Used by the PM agent for technical constraints.
 *
 * Primary use: 36-inch rule (lighting in bathrooms only). For bathroom walls with
 * mirror/vanity, if wall width < 36", the agent overrides side-mounted sconces with a
 * horizontal overhead fixture. Sconce+mirror pairings for 36" walls must allow at least 1"
 * margin on each side of the sconce. This rule is not applied to other slots (tile, hardware, etc.).
 * Supply dimensions when you have them; when absent, the 36-inch rule is skipped for that room.
 */
export interface RoomDimensions {
  roomId: string;
  /** Wall width in inches (e.g. bathroom mirror wall). Used for sconce vs overhead override. */
  wallWidthInches?: number;
  /** Other dimension keys as needed (e.g. ceiling height, room length). */
  [key: string]: unknown;
}

/** Project metadata passed into the PM agent (from Intake / quiz answers). */
export interface ProjectMetadata {
  answers: QuizAnswers;
  /** Room dimensions when available (e.g. from builder or user input). */
  dimensions?: RoomDimensions[];
}

/** Output state of the PM agent. Consumed by Studio Coordinator for the Decision Details table. */
export interface ProjectManagerAgentOutput {
  /** Final list of approved (and possibly swapped) materials; each has scopeReasoning for the Scope column. */
  auditedMaterials: ProposedMaterial[];
  /** Budget fit result from budgetHeuristics (comfortable | tight | mismatch). */
  budgetStatus: BudgetFit;
  /** Human-readable reasoning for every swap or constraint (audit log). Not shown in Decision Details. */
  professionalReasoning: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Creative Director ↔ PM loop: real products from DB
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One product from the database (Master Products). Creative Director returns
 * multiple of these per slot; PM selects exactly one per slot.
 */
export interface ProductCandidate {
  /** Stable id: e.g. "vendor.vendor_sku" (cletile.Z20026) */
  id: string;
  vendor: string;
  vendor_sku: string;
  slotId: string;
  roomId?: string;
  title: string;
  /** DB material (marble, porcelain, quartz, zellige, etc.) — used for PM rules */
  material: string;
  /** DB finish (honed, glazed, unlacquered, lacquered, etc.) */
  finish?: string;
  finish_family?: string;
  /** For fiscal/scope rules */
  tier?: MaterialTier;
  price?: number;
  currency?: string;
  /** For 36-inch rule (lighting in bathrooms only): sconce vs overhead */
  fixtureType?: "sconce" | "overhead" | "other";
  /** Pairing/compatibility: used by PM to keep selections coherent across slots (see PairingRule). */
  compatibility_key?: string;
  metal_match_key?: string;
  /** Product IDs or labels this pairs with (e.g. "Zellige subway, plaster, ceramic subway"); PM can match against other slot's selected product id or title. */
  pairing_option?: string | string[];
  /** Optional: url, image_url1, etc. for Studio Coordinator */
  url?: string;
  image_url1?: string;
  [key: string]: unknown;
}

/**
 * Creative Director input (from Intake / quiz). Used to drive aesthetic product selection.
 * Axis names match quiz/scoring: modernRustic, minimalLayered, brightMoody (0–1).
 * color_mood comes from the last quiz question ("What's your ideal color mood?").
 *
 * For user adjustment flows (e.g. "change this light fixture"), also pass
 * adjustmentRequest and optionally currentMoodboardState so CD can return new
 * candidates for the target slot (and paired slots) that satisfy the request.
 */
export interface CreativeDirectorInput {
  /** Primary archetype, e.g. parisian | provincial | mediterranean */
  primaryArchetype: string;
  /** Style axes 0–1 from quiz (do not rename in codebase) */
  modernRustic: number;
  minimalLayered: number;
  brightMoody: number;
  /** Room list for slot scoping */
  rooms: string[];
  /** Color mood from last quiz question: mood_01 … mood_05 */
  color_mood?: "mood_01" | "mood_02" | "mood_03" | "mood_04" | "mood_05";
  /** Optional: exterior style for palette/constraints */
  exteriorStyle?: string;
  /** Optional: full quiz answers for extra signals */
  answers?: QuizAnswers;

  /** Optional: when user asks to change a specific element on the moodboard (future-proofing). */
  adjustmentRequest?: UserAdjustmentRequest;
  /** Optional: current selections for the moodboard being edited (for pairing and context). */
  currentMoodboardState?: Record<string, SelectedProduct>;
}

/**
 * Rule from Creative Director: products in slotKeyB must be compatible with the
 * product already chosen for slotKeyA. PM picks slotKeyA first, then filters
 * slotKeyB candidates by matchBy so the final selection pairs correctly.
 */
export interface PairingRule {
  /** Slot chosen first (anchor). */
  slotKeyA: string;
  /** Slot chosen second; candidates filtered to those compatible with selection for slotKeyA. */
  slotKeyB: string;
  /** How to check compatibility (values must match, or for pairing_option see implementation). */
  matchBy: "compatibility_key" | "metal_match_key" | "pairing_option";
}

/**
 * Creative Director output: multiple product candidates per slot plus pairing rules.
 * PM receives this and returns exactly one product per slot (no nulls), respecting
 * pairing so selections across slots are compatible.
 */
export interface CreativeDirectorOutput {
  /** Key = slotId or "slotId|roomId"; value = array of candidates from DB for that slot */
  candidatesBySlot: Record<string, ProductCandidate[]>;
  /** Or: array of { slotId, roomId?, candidates } for ordered slots */
  slots?: { slotId: string; roomId?: string; candidates: ProductCandidate[] }[];
  /**
   * Pairing rules across slots. PM will select slotKeyA first, then filter slotKeyB
   * to candidates compatible with that selection. Order of selection is derived
   * from these rules so dependencies are respected.
   */
  pairingRules?: PairingRule[];
}

/**
 * One selected product per slot. PM always returns one product per slot — no nulls.
 */
export interface SelectedProduct {
  /** The chosen product (same shape as ProductCandidate) */
  product: ProductCandidate;
  /** Human-readable Scope column text for Decision Details table */
  scopeReasoning: string;
}

/**
 * PM output when working with real products (Creative Director loop).
 * One selected product per slot; budgetStatus and audit log.
 */
export interface ProjectManagerSelectionOutput {
  /** Exactly one selected product per slot. No nulls. */
  selectionsBySlot: Record<string, SelectedProduct>;
  /** Ordered list for Studio Coordinator (matches slot order) */
  selections: SelectedProduct[];
  budgetStatus: BudgetFit;
  professionalReasoning: string[];
}

// ─── Future-proofing: multiple moodboards per room & user adjustment requests ───

/** Stable id for one moodboard variation (e.g. "variation_1", or uuid). */
export type MoodboardVariationId = string;

/**
 * Identifies a single element on a moodboard so the user can say "change this."
 * Used when the user selects a fixture/product on the moodboard and asks for an adjustment.
 */
export interface MoodboardElementTarget {
  /** Room this moodboard belongs to (if moodboards are per-room). */
  roomId?: string;
  /** Which variation/moodboard (when multiple per room). */
  moodboardVariationId?: MoodboardVariationId;
  /** Slot key (slotId or "slotId|roomId") that holds the product to change. */
  slotKey: string;
}

/**
 * User request to adjust a specific element on the moodboard (e.g. "change to something warmer",
 * "brass instead of nickel", "different style"). Passed to CD so it can return new candidates
 * for that slot (and any paired slots) that satisfy the request.
 */
export interface UserAdjustmentRequest {
  /** Which element the user is referring to. */
  target: MoodboardElementTarget;
  /** Natural-language or structured constraint (e.g. "warmer finish", "brass", "more minimal"). */
  request: string;
  /** Current selections for this moodboard so CD/PM can respect pairing and context. Optional. */
  currentSelectionsBySlot?: Record<string, SelectedProduct>;
}

/**
 * One moodboard variation: a full set of selections (and optional metadata).
 * Use this to store multiple moodboards per room or per project.
 */
export interface MoodboardVariation {
  variationId: MoodboardVariationId;
  /** Selections for this variation (same shape as PM output for the scope of this moodboard). */
  selectionsBySlot: Record<string, SelectedProduct>;
  /** Ordered list for rendering. */
  selections?: SelectedProduct[];
  budgetStatus?: BudgetFit;
  professionalReasoning?: string[];
}

/**
 * Multiple moodboard variations per room. Key = roomId; value = list of variations.
 * Enables "generate 2–3 options for this room" and user switching between them.
 */
export type RoomMoodboardSet = Record<string, MoodboardVariation[]>;
