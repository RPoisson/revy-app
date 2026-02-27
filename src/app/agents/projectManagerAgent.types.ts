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
  /** Fixture type for 40-inch rule: "sconce" | "overhead" | etc. */
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
 * Primary use: 40-inch rule (lighting in bathrooms only). For bathroom walls with
 * mirror/vanity, if wall width < 40", the agent overrides side-mounted sconces with a
 * horizontal overhead fixture. This rule is not applied to other slots (tile, hardware, etc.).
 * Supply dimensions when you have them; when absent, the 40-inch rule is skipped for that room.
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
  /** For 40-inch rule (lighting in bathrooms only): sconce vs overhead */
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
