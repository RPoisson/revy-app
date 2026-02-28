# Creative Director agent — implementation roadmap

This doc lists the **concrete steps** to implement the Creative Director (CD) agent and wire it into the Intake → CD → PM → Studio Coordinator loop. Current state: types and contracts are defined; PM is built; CD logic and product data layer are not yet implemented.

---

## What’s already in place

- **Types**: `CreativeDirectorInput`, `CreativeDirectorOutput`, `ProductCandidate`, `PairingRule`, `UserAdjustmentRequest`, `MoodboardElementTarget`, etc. in `projectManagerAgent.types.ts`.
- **PM**: `runProjectManagerSelection(metadata, creativeDirectorOutput)` in `projectManagerSelection.ts`.
- **Style policy**: `styleDNA.ts` (STYLE_DNA), `style_render_map.ts` (STYLE_RENDER_MAP) with per-archetype slot rules and weights (3/2/1/-1).
- **Scoring**: `scoring.ts` → `scoreQuiz(answers)` returns `primaryArchetype`, `modernRustic`, `minimalLayered`, `brightMoody`.
- **Docs**: `CREATIVE_DIRECTOR_ALIGNMENT.md`, `QUIZ_IMAGES_AESTHETIC_REFERENCE.md`, `AGENT_LOOP_AND_CONTEXT.md`, `CD_MULTIPLE_MOODBOARDS_AND_INTERACTION.md`, `LOOP_AND_PAIRING.md`.

---

## Implementation order

### 1. Build `CreativeDirectorInput` from quiz answers

**Goal:** One function that turns `QuizAnswers` (and optional room list) into `CreativeDirectorInput` so the rest of the app doesn’t need to know the CD input shape.

- **Input:** `answers: QuizAnswers`, optionally `rooms?: string[]`.
- **Logic:**
  - Call `scoreQuiz(answers)` → get `primaryArchetype`, `modernRustic`, `minimalLayered`, `brightMoody`.
  - Read `color_mood` from `answers["color_mood"]` (first value if array) → type as `mood_01` … `mood_05`.
  - Derive `rooms`: either from `answers["spaces_appeal"]` (map space_01…space_27 to room labels if you have a mapping), or a fixed list (e.g. `["kitchen", "primary_bath", "living"]`), or from another quiz question.
  - Optionally: `exteriorStyle` from `answers["home_exterior_style"]`, `answers` for full passthrough.
- **Output:** `CreativeDirectorInput`.
- **Where:** e.g. `agents/buildCreativeDirectorInput.ts` or `agents/intakeToCDInput.ts`.

**Deliverable:** `buildCreativeDirectorInput(answers: QuizAnswers, options?: { rooms?: string[] }): CreativeDirectorInput`.

---

### 2. Product data layer (candidates per slot)

**Goal:** CD needs a way to get product candidates by slot (and optionally room). Until Supabase is wired, use a **mock** that returns a small set of `ProductCandidate[]` per slot so the pipeline runs end-to-end.

- **Option A — Mock in repo:** Define a static list or small JSON of `ProductCandidate`-shaped objects per slot (e.g. 5–10 per slot), with `slotId`, `roomId?`, `material`, `finish`, `compatibility_key`, `metal_match_key`, `fixtureType` where relevant. Implement `getCandidatesForSlot(slotKey: string, _filters?: object): Promise<ProductCandidate[]>` that returns mock data.
- **Option B — Supabase:** Add a client/service that queries `master_products` (or your table) by category/slot, material, finish, etc., and maps rows to `ProductCandidate`. Same interface: `getCandidatesForSlot(slotKey, filters?)` (or `getCandidatesForSlots(slotKeys[], filters?)` for batch).

**Deliverable:** A data module the CD can call, e.g. `agents/productData.ts` with `getCandidatesForSlot` (and optionally `getCandidatesForSlots`). Start with mock; swap to Supabase when ready.

---

### 3. Creative Director core: `runCreativeDirector(input)`

**Goal:** Implement the CD entry point that returns `CreativeDirectorOutput` (candidatesBySlot + pairingRules).

- **Input:** `CreativeDirectorInput` (from step 1).
- **Logic (high level):**
  1. **Archetype & slots:** Use `input.primaryArchetype` to select the right `STYLE_RENDER_MAP` entry (parisian | provincial | mediterranean). Decide which slots to fill from `input.rooms` and your app’s slot list (e.g. tile_floor, tile_wall, lighting, vanity, countertop, hardware, etc.). Slot keys = `slotId` or `slotId|roomId` when room-scoped.
  2. **Candidates per slot:** For each slot key, call the product data layer (`getCandidatesForSlot` or batch). If you have filters (e.g. material family, finish), pass them from archetype + color_mood.
  3. **Rank/filter:** Use `STYLE_RENDER_MAP[archetype].slots[slotId]`: weights (3/2/1/-1), `include`, `avoidLite`, `hardRules`. Score or filter candidates so higher-weight terms are preferred. Use `input.modernRustic`, `input.minimalLayered`, `input.brightMoody` to bias (e.g. high rustic → prefer raw/organic; high minimal → prefer clean lines). Use `input.color_mood` to bias palette (see `QUIZ_IMAGES_AESTHETIC_REFERENCE.md`).
  4. **Pairing rules:** Emit a fixed or archetype-dependent list of `PairingRule[]`, e.g. `{ slotKeyA: "faucet", slotKeyB: "hardware", matchBy: "metal_match_key" }`, `{ slotKeyA: "tile_floor", slotKeyB: "grout", matchBy: "compatibility_key" }`.
  5. **Cap and return:** For each slot, keep top 5–10 candidates (at least 1). Return `{ candidatesBySlot, pairingRules }`.
- **Adjustment mode:** When `input.adjustmentRequest` is set, restrict to `target.slotKey` (and any slots that pair with it). Optionally pass `currentMoodboardState` so CD only returns candidates for the target (and paired) slots; product layer or ranking can use `adjustmentRequest.request` as a text filter or constraint.
- **Output:** `CreativeDirectorOutput`.

**Deliverable:** `agents/creativeDirectorAgent.ts` (or `creativeDirector.ts`) with `runCreativeDirector(input: CreativeDirectorInput): Promise<CreativeDirectorOutput>` (or sync if data layer is sync).

---

### 4. Default pairing rules

**Goal:** Define a small set of `PairingRule`s the CD always (or per archetype) returns so the PM can enforce compatibility.

- E.g. `faucet` ↔ `hardware` by `metal_match_key`; `tile_floor` ↔ `grout` by `compatibility_key`; etc. Same keys as in `candidatesBySlot`.
- **Deliverable:** Either in `creativeDirectorAgent.ts` or a small `pairingRules.ts` that the CD imports and optionally filters by slot keys present in `candidatesBySlot`.

---

### 5. Wire Intake → CD → PM in the app

**Goal:** From the Design Concept (or wherever moodboard/decisions are generated), call: build CD input → run CD → run PM → pass PM output to the Studio Coordinator / Decision Details.

- After quiz (or when user opens Design Concept):  
  `const cdInput = buildCreativeDirectorInput(answers, { rooms });`  
  `const cdOutput = await runCreativeDirector(cdInput);`  
  `const pmOutput = runProjectManagerSelection({ answers, dimensions }, cdOutput);`  
  Then use `pmOutput.selectionsBySlot` / `pmOutput.selections` and `scopeReasoning` for the Decision Details table and any moodboard data.
- **Deliverable:** A single function or page/API flow that runs this pipeline and stores or passes the result to the UI (no LangGraph required for a first version).

---

### 6. (Optional) LangGraph node

**Goal:** When you introduce LangGraph, wrap `runCreativeDirector` in a node that reads from graph state (e.g. “intake” or “answers”) and writes `CreativeDirectorOutput` to state for the PM node.

- **Deliverable:** A node that calls `runCreativeDirector(state.cdInput)` and sets `state.cdOutput` (or equivalent).

---

### 7. (Later) Real product DB and ranking

- Connect the product data layer to Supabase; map columns to `ProductCandidate`.
- Refine ranking (e.g. vector search by style brief, or richer scoring using slot rules and axis scores).
- Add support for `adjustmentRequest` so “change this fixture” calls CD with target + request and returns new candidates for that slot (and paired slots); PM re-runs and you merge back into the moodboard (see `CD_MULTIPLE_MOODBOARDS_AND_INTERACTION.md`).

---

## Suggested file layout

```
src/app/agents/
  projectManagerAgent.types.ts   # existing
  projectManagerSelection.ts     # existing (PM)
  projectManagerAgent.ts        # existing (legacy audit)
  materialSwapMaps.ts           # existing
  buildCreativeDirectorInput.ts # NEW: quiz → CD input
  productData.ts                # NEW: getCandidatesForSlot (mock then Supabase)
  creativeDirectorAgent.ts      # NEW: runCreativeDirector
  pairingRules.ts               # NEW (optional): default pairing rules
  index.ts                      # export buildCreativeDirectorInput, runCreativeDirector, …
```

---

## Summary

1. **Build CD input** from quiz (`buildCreativeDirectorInput`).
2. **Product data layer** with mock then Supabase (`getCandidatesForSlot`).
3. **CD core** (`runCreativeDirector`: slots, fetch candidates, rank/filter with style_render_map + axes + color_mood, emit pairing rules).
4. **Default pairing rules** for faucet/hardware, tile/grout, etc.
5. **Wire pipeline** in the app (Intake → CD → PM → Studio Coordinator).
6. **(Optional)** LangGraph node for CD.
7. **(Later)** Real DB, better ranking, adjustment flow.

Implementing steps 1–4 and 5 with mock data gives you an end-to-end loop you can test before connecting a real product database.

---

## Quick test (already implemented)

Steps 1–2 and the stub CD are in place. You can run the pipeline like this:

```ts
import { getAnswers } from "@/app/quiz/lib/answersStore";
import {
  buildCreativeDirectorInput,
  runCreativeDirector,
  runProjectManagerSelection,
} from "@/app/agents";

const answers = getAnswers(projectId); // or {} for minimal test
const cdInput = buildCreativeDirectorInput(answers, { rooms: ["kitchen", "primary_bath"] });
const cdOutput = runCreativeDirector(cdInput);
const pmOutput = runProjectManagerSelection({ answers }, cdOutput);

// pmOutput.selectionsBySlot, pmOutput.selections, pmOutput.budgetStatus, and each selection has scopeReasoning
```

Current mock provides candidates for `lighting`, `hardware`, and `tile_floor`; pairing rule is `hardware` → `lighting` by `metal_match_key`. Next: wire this into the Design Concept page (step 5) and add ranking by `STYLE_RENDER_MAP` + Supabase (step 7).
