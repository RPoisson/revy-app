# Creative Director: multiple moodboards per room & user interaction

This document future-proofs the Creative Director (and downstream PM / Studio Coordinator) for:

1. **Multiple moodboards per room** — User can generate several variations per room and switch between them.
2. **User interaction with the moodboard** — User can select an element (e.g. a light fixture) and ask to change it ("something warmer", "brass instead", "different style"); the system re-runs CD/PM for that slot and updates the moodboard.

Current behavior is unchanged: one moodboard per room (or one project-level set of selections). The types and flows below are **additive** so that when you implement these features, the CD and PM contracts already support them.

---

## 1. Types added (future-proofing)

All in `projectManagerAgent.types.ts` and exported from `agents/index.ts`:

| Type | Purpose |
|------|--------|
| **MoodboardVariationId** | Stable id for one moodboard variation (e.g. `"variation_1"` or uuid). |
| **MoodboardElementTarget** | Identifies one element on a moodboard: `roomId?`, `moodboardVariationId?`, `slotKey`. When the user clicks "this light," the UI sets this so the backend knows which slot (and which variation) to change. |
| **UserAdjustmentRequest** | `target` (MoodboardElementTarget) + `request` (natural-language or structured constraint) + optional `currentSelectionsBySlot`. Passed to CD when the user asks to change an element. |
| **MoodboardVariation** | One moodboard's worth of data: `variationId`, `selectionsBySlot`, optional `selections`, `budgetStatus`, `professionalReasoning`. |
| **RoomMoodboardSet** | `Record<roomId, MoodboardVariation[]>` — multiple moodboard variations per room. |

**CreativeDirectorInput** was extended with:

- **adjustmentRequest?: UserAdjustmentRequest** — When present, CD is in "adjustment" mode: return new candidates for the target slot (and any slots that must stay compatible via pairing) that satisfy the user’s request.
- **currentMoodboardState?: Record<string, SelectedProduct>** — Current selections for the moodboard being edited, so CD/PM can respect pairing and context when re-running for one slot.

---

## 2. Multiple moodboards per room

### Stored state

- **Per room:** Store a list of variations, e.g. `RoomMoodboardSet[roomId] = MoodboardVariation[]`.
- Each **MoodboardVariation** has its own `selectionsBySlot` (and optionally `selections`, `budgetStatus`, `professionalReasoning`), i.e. one full PM-style result per variation.

### Generating multiple variations

- **Option A:** Run the full CD → PM pipeline **N times** (e.g. with different randomness or diversity knobs) to produce N different `ProjectManagerSelectionOutput`s; map each to a `MoodboardVariation` and store under the same `roomId`.
- **Option B:** CD is extended to accept something like `numberOfVariations: number` and return N candidate sets (e.g. N different `CreativeDirectorOutput`s or one structure with N variation candidate sets); PM is run N times (once per set), and each result becomes one `MoodboardVariation`.

UI can show a carousel or tabs per room ("Option 1", "Option 2", …) and persist the chosen variation per room. No change to the core CD output contract: each run still returns candidates + pairing rules; only the orchestration layer (e.g. LangGraph or app state) stores and displays multiple variations.

---

## 3. User interaction: "Change this element"

### Flow

1. **User** selects an element on the moodboard (e.g. a light fixture). The UI knows:
   - **slotKey** (e.g. `"lighting|primary_bath"`),
   - **roomId** (if moodboards are per-room),
   - **moodboardVariationId** (which variation is being edited).
2. **User** enters a request (e.g. "warmer finish", "brass instead of nickel", "more minimal").
3. **Backend** builds:
   - **MoodboardElementTarget**: `{ roomId, moodboardVariationId, slotKey }`,
   - **UserAdjustmentRequest**: `{ target, request, currentSelectionsBySlot }` (currentSelectionsBySlot = that variation’s `selectionsBySlot`).
4. **Creative Director** is called with:
   - Same style/archetype/axes/rooms/color_mood as initial generation,
   - **adjustmentRequest** = the UserAdjustmentRequest,
   - **currentMoodboardState** = that variation’s selections (so CD can preserve pairing and context).
5. **CD** returns a **CreativeDirectorOutput** that:
   - Focuses on the **target slot** (and any slots paired with it): either full `candidatesBySlot` as today, or a contract extension later for "only these slots" to avoid re-querying everything. For a minimal change, CD can return candidates only for the target slot and any slotKeyB that depends on it; PM then needs the rest of the current selections as fixed context.
6. **PM** is called with:
   - Same **ProjectMetadata** as before,
   - **CreativeDirectorOutput** from step 5,
   - Optional: **fixedSelections** (current selections for all slots *not* being re-chosen) so PM only re-selects the target slot (and paired slots) and leaves the rest unchanged.
7. **Result** is merged back into the moodboard: update `selectionsBySlot` for the target (and any re-run paired slots) in that **MoodboardVariation**; leave other slots and other variations unchanged.

### PM and "partial" re-run

Today PM expects a full `CreativeDirectorOutput` and returns a full `ProjectManagerSelectionOutput`. To support "change only this fixture":

- **Option A (simplest):** CD returns candidates for **all** slots (as today), but the orchestration layer passes **currentSelectionsBySlot** as fixed context; PM’s contract is extended to accept optional **fixedSelectionsBySlot**: for any slot in that map, PM does not re-select and keeps that selection. So only the target slot (and slots not in fixedSelectionsBySlot) are re-run. No change to CD output shape.
- **Option B:** CD returns candidates only for the target slot (+ paired slots if needed); PM accepts a "partial" candidate set and **currentSelectionsBySlot** for the rest, and runs selection only for the slots that have new candidates. This requires a small extension of the PM input (e.g. `existingSelectionsBySlot?: Record<string, SelectedProduct>`).

Recommendation: start with **Option A** (full CD output, PM with optional fixed selections) so the CD and PM contracts stay backward-compatible and only the orchestration layer needs to know about "adjustment" mode.

---

## 4. UI and stable identifiers

- **MoodboardElementTarget** must be derivable from the UI when the user clicks an element: e.g. each rendered product on the moodboard is associated with a `slotKey`; the current view has `roomId` and `moodboardVariationId`. Send these with the user’s request so the backend can identify the slot and variation.
- **MoodboardVariationId** should be stable (e.g. generated once per variation and stored with the variation) so that "change this fixture" and "switch to option 2" both refer to the same variation unambiguously.

---

## 5. Summary

- **Types:** `MoodboardVariationId`, `MoodboardElementTarget`, `UserAdjustmentRequest`, `MoodboardVariation`, `RoomMoodboardSet`; and **CreativeDirectorInput** extended with `adjustmentRequest` and `currentMoodboardState`.
- **Multiple moodboards:** Store `RoomMoodboardSet` (or project-level list of variations); generate multiple variations by running CD → PM multiple times (or by extending CD to return N option sets).
- **Interaction:** User selects element → build **UserAdjustmentRequest** → call CD with **adjustmentRequest** + **currentMoodboardState** → CD returns (full or focused) candidates → PM re-runs with optional fixed selections → merge result back into the chosen **MoodboardVariation**.

No changes to the current moodboard or Decision Details UI are required for existing behavior; this design only adds the types and the described flows for when you implement multiple moodboards and user-driven adjustments.
