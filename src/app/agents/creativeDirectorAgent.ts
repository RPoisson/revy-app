// src/app/agents/creativeDirectorAgent.ts
// Creative Director agent: builds candidates per slot and pairing rules from style input.
// Uses mock product data; later wire to Supabase and STYLE_RENDER_MAP for ranking.

import type {
  CreativeDirectorInput,
  CreativeDirectorOutput,
  PairingRule,
  ProductCandidate,
} from "./projectManagerAgent.types";
import { getCandidatesForSlot, getMockSlotIds } from "./productData";

const MAX_CANDIDATES_PER_SLOT = 10;

/** Default pairing rules so PM can enforce compatibility. Only include slots that have candidates. */
function getDefaultPairingRules(slotKeys: string[]): PairingRule[] {
  const rules: PairingRule[] = [];
  if (slotKeys.includes("hardware") && slotKeys.includes("lighting")) {
    rules.push({ slotKeyA: "hardware", slotKeyB: "lighting", matchBy: "metal_match_key" });
  }
  return rules;
}

/**
 * Run the Creative Director: from style input, produce candidates per slot and pairing rules.
 * Today: uses mock product data and does not yet rank by STYLE_RENDER_MAP; returns all mock candidates per slot.
 * Next: add filtering/ranking by archetype slot rules and axis scores, then Supabase.
 */
export function runCreativeDirector(input: CreativeDirectorInput): CreativeDirectorOutput {
  const slotKeys = getMockSlotIds();
  const candidatesBySlot: Record<string, ProductCandidate[]> = {};

  for (const slotKey of slotKeys) {
    const raw = getCandidatesForSlot(slotKey, {
      archetype: input.primaryArchetype,
      metalMatchKey: undefined,
    });
    const capped = raw.slice(0, MAX_CANDIDATES_PER_SLOT);
    if (capped.length > 0) {
      candidatesBySlot[slotKey] = capped;
    }
  }

  const pairingRules = getDefaultPairingRules(slotKeys);

  return {
    candidatesBySlot,
    pairingRules,
  };
}
