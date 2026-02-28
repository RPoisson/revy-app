# Rêvy agent loop and context (for Creative Director build)

Use this document when continuing work on the **Creative Director agent** or the overall loop. It summarizes the loop design, PM agent (already built), and the contract the Creative Director must fulfill.

---

## 1. Where the PM agent lives (already built)

All of this is in the repo under **`revy/revy-quiz/src/app/agents/`**:

| File | Purpose |
|------|--------|
| `projectManagerAgent.types.ts` | Types: ProjectMetadata, ProductCandidate, CreativeDirectorOutput, PairingRule, ProjectManagerSelectionOutput, SelectedProduct, RoomDimensions, etc. |
| `projectManagerSelection.ts` | **Main entry point for the loop**: `runProjectManagerSelection(metadata, creativeDirectorOutput)` — returns one product per slot, respects pairing, finish/scope first then budget. |
| `projectManagerAgent.ts` | Legacy audit path: `runProjectManagerAudit(metadata, proposedMaterials)` — abstract material IDs; use selection path for the CD ↔ PM loop. |
| `materialSwapMaps.ts` | Swap maps for fiscal/rental/finish tier (used by audit path; selection path uses DB material/finish strings). |
| `index.ts` | Exports `runProjectManagerSelection`, `runProjectManagerAudit`, and all types. |
| `LOOP_AND_PAIRING.md` | Loop order and pairing rules (CD ↔ PM ↔ Studio Coordinator). |
| `MASTER_PRODUCTS_SUPABASE.md` | Master Products schema, pgVector note, CD ↔ PM loop (no “linking” step). |
| `SOURCELIST_IDS_AND_METADATA.md` | RoomDimensions, IDs/tagging, 36-inch rule (lighting in bathrooms only). |

**You do not need to save PM agent “detail” elsewhere** — it’s already in these files. This doc is the **context to share back** so the next session knows the loop and contracts.

---

## 2. Overall loop design

1. **Intake** (quiz/scope/budget) → user answers, project metadata, room list.
2. **Creative Director** (to build):
   - **Input**: User/quiz context (style, archetype, rooms, budget tier, etc.), access to product DB (e.g. Supabase Master Products).
   - **Output**: `CreativeDirectorOutput` — multiple **product candidates per slot** + **pairing rules**.
   - **Responsibility**: Aesthetic product decisions; which products to consider for each slot; which slots must be paired (e.g. tile + grout, hardware + faucet).
3. **Project Manager** (built):
   - **Input**: `ProjectMetadata` (answers, optional RoomDimensions) + `CreativeDirectorOutput`.
   - **Output**: `ProjectManagerSelectionOutput` — **exactly one product per slot** (no nulls), `scopeReasoning` per slot, `budgetStatus`, `professionalReasoning`.
   - **Responsibility**: Finish/scope rules first (rental, flip, finish tier, 36-inch rule for **lighting in bathrooms only**), then pairing (filter slotKeyB by compatibility with selected slotKeyA), then budget; guarantee one product per slot.
4. **Studio Coordinator** (to finalize):
   - **Input**: PM output (selections, scopeReasoning) + any layout/room config.
   - **Output**: Renders **Design Details** — moodboards and **Decision Details table** (Scope column = PM’s `scopeReasoning`; no rule IDs shown).

**Loop is one shot**: CD sends candidates + pairing rules once; PM selects in dependency order; Studio Coordinator renders. No multi-round negotiation.

---

## 3. Creative Director output contract (what the CD must produce)

The Creative Director must return a **`CreativeDirectorOutput`** with:

- **`candidatesBySlot`**: `Record<string, ProductCandidate[]>` — key = slot id or `"slotId|roomId"`, value = array of product candidates from the DB for that slot.  
  **Or** `slots`: `{ slotId, roomId?, candidates: ProductCandidate[] }[]` for ordered slots.
- **`pairingRules`** (optional): `PairingRule[]` — each rule says `slotKeyB` must be compatible with the selection for `slotKeyA`; `matchBy` is `"compatibility_key"` | `"metal_match_key"` | `"pairing_option"`.

**ProductCandidate** (each candidate from the DB) must include at least:

- `id`, `vendor`, `vendor_sku`, `slotId`, `roomId?`, `title`, `material`, `finish?`, `finish_family?`, `tier?`, `price?`, `currency?`, `fixtureType?` (for lighting; 36-inch rule only for lighting in bathrooms), `compatibility_key?`, `metal_match_key?`, `pairing_option?`, `url?`, `image_url1?`.

**Contract**: At least one candidate per slot so the PM can always return one product per slot (no nulls). Pairing rules use the same slot keys as in `candidatesBySlot` / `slots`.

---

## 4. Project Manager input/output (already implemented)

- **Input**: `ProjectMetadata` (`.answers` = quiz answers, `.dimensions?` = optional RoomDimensions for 36-inch rule) and `CreativeDirectorOutput` (candidates + pairing rules).
- **Output**: `ProjectManagerSelectionOutput`:
  - `selectionsBySlot`: one `SelectedProduct` per slot key.
  - `selections`: ordered list for Studio Coordinator.
  - Each `SelectedProduct`: `product` (ProductCandidate), `scopeReasoning` (human-readable for Decision Details Scope column).
  - `budgetStatus`, `professionalReasoning`.

**Selection order**: Derived from pairing rules (slotKeyA before slotKeyB). For each slot, PM applies finish/scope, then pairing filter, then budget rank, and picks one. 36-inch rule applies **only to lighting in bathrooms**; other slots are not considered.

---

## 5. Studio Coordinator input (for finalizing the renderer)

- **Input**: PM’s `ProjectManagerSelectionOutput` (e.g. `selections`, `selectionsBySlot`) and any room/layout config.
- **Renders**: Design Details moodboards and Decision Details table; Scope column = each selection’s `scopeReasoning`; no rule IDs or rule UI.

### Future-proofing: multiple moodboards per room & user interaction

The CD and types are designed so you can later support:
- **Multiple moodboards per room** — Store several variations (`MoodboardVariation[]` per room); generate by running CD → PM multiple times (or extend CD to return N option sets).
- **User adjustment** — User selects an element (e.g. a light fixture) and asks to change it; send `UserAdjustmentRequest` (target slot + request) and current moodboard state to CD; CD returns new candidates; PM re-runs for that slot (and paired slots); merge result back into the variation.

See **`CD_MULTIPLE_MOODBOARDS_AND_INTERACTION.md`** for types (`MoodboardElementTarget`, `UserAdjustmentRequest`, `MoodboardVariation`, `RoomMoodboardSet`), extended `CreativeDirectorInput` (`adjustmentRequest`, `currentMoodboardState`), and the flow for "change this fixture."

---

## 6. Prompt you can paste back when starting the Creative Director

Copy the block below into a new chat when you want to continue with the Creative Director agent:

```
I'm working on the Rêvy app and need to build the **Creative Director agent**. It sits in the loop between Intake and the Project Manager.

**Context**: The full loop design, PM agent (already built), and the exact output contract the Creative Director must fulfill are documented in:

- `revy/revy-quiz/src/app/agents/AGENT_LOOP_AND_CONTEXT.md`

Please read that file first. In short:

- **Creative Director** takes user/quiz context (style, archetype, rooms, budget tier, etc.) and the product DB (e.g. Supabase Master Products), and returns:
  - Multiple **product candidates per slot** (ProductCandidate[] per slot).
  - **Pairing rules** (slotKeyA, slotKeyB, matchBy) so the PM can keep selections compatible across slots (e.g. tile + grout, hardware + faucet).

- The PM (already built) then selects exactly one product per slot using those candidates and rules, and the Studio Coordinator renders the Design Details (moodboards + Decision table).

I want to implement the Creative Director agent: its inputs, aesthetic reasoning, and how it queries the DB and produces `CreativeDirectorOutput` (candidatesBySlot/slots + pairingRules). I have additional context to share on style rules, archetypes, and the product database.
```

---

## 7. Summary

- **PM agent**: Already built in `revy-quiz/src/app/agents/`; no need to re-save it elsewhere.
- **This file**: Save it as-is and share it (or the path) when you continue with the Creative Director so the overall loop, types, and contracts are clear.
- **Prompt**: Use the block in §6 in a new session so the assistant reads `AGENT_LOOP_AND_CONTEXT.md` and then builds the Creative Director to the contract above.
