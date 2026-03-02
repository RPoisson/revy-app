# LLM use for Creative Director style reasoning and Design Detail summary

**Implemented:** A lightweight model (gpt-4o-mini) is used for both touchpoints via `POST /api/design-concept/render-text`. See `src/lib/llm/`, `src/app/api/design-concept/render-text/route.ts`, and the "Create Designs" flow in the brief page.

We have two LLM touchpoints:

1. **Creative Director → style reasoning** – Why each selection fits the user’s style (archetype, axes, color mood). Today the Decision Detail table shows a placeholder for style; we want real, model-generated reasoning.
2. **Design Detail summary** – The executive summary (Targeting Your Investment Range, Strategic Trade-offs, Matches Your Unique Style, Intentional Selections) should be generated or summarized by an LLM from structured project data so the copy is consistent and on-brand.

Both can live in **Next.js API routes or Server Actions**; LangGraph is optional for orchestration later.

---

## 1. Creative Director: style reasoning via LLM

**Goal:** For each selected product (after PM has chosen one per slot), produce a short **style reasoning** string that explains why that product fits the user’s style. This fills the **Style** column in the Decision Detail table and makes the concept feel personalized.

**When to call:** After the PM returns `ProjectManagerSelectionOutput` (one product per slot). Either:

- **Option A:** A single LLM call that takes all selections + context and returns one style reasoning string per slot (batch).
- **Option B:** One LLM call per slot (simpler prompts, more latency/cost unless parallelized).

**Inputs to the LLM (per slot or batch):**

- User style context: `primaryArchetype`, `modernRustic`, `minimalLayered`, `brightMoody`, `color_mood` (from CD input / quiz).
- Optional: 1–2 sentence style brief (e.g. from `STYLE_DNA[archetype].essence` + `signatureNotes`).
- For each slot: `slotId` / slot title, selected product (e.g. `title`, `material`, `finish`, `vendor`).

**Output:** A short paragraph or 1–2 sentences per slot, e.g.:

- “This fixture’s aged brass and simple lines align with your Provincial style—warm, tactile, and understated.”
- “The honed finish and neutral tone support your minimal-layered direction and the chosen color mood.”

**Where it plugs in:**

- Today: `buildDesignConceptFromAgentOutput` sets `styleReasoning: "Aligns with style intent."` for every row.
- With LLM: Either (1) the CD pipeline (or a small “style reasoner” step after PM) calls the LLM and attaches a `styleReasoning` string to each selection, and we store that in the design concept output, or (2) an API returns `{ styleReasoningBySlot: Record<string, string> }` and the Studio Coordinator merges it into the materials rows when building `DesignConceptDetail`.

**Suggested flow:** After `runProjectManagerSelection` in the “Create Designs” flow, call a new function or API (e.g. `generateStyleReasoning(selectionsBySlot, cdInput)`) that calls the LLM and returns style reasoning per slot key. Merge into each `SelectedProduct` or into the object we pass to `buildDesignConceptFromAgentOutput` so that `MaterialDecisionRow.styleReasoning` is the LLM output.

---

## 2. Design Detail summary: LLM-generated narrative blocks

**Goal:** The four executive summary blocks (Targeting Your Investment Range, Strategic Trade-offs, Matches Your Unique Style, Intentional Selections) should be **generated or summarized by an LLM** from structured project data so the wording is consistent, on-brand, and tailored to the project.

**Inputs to the LLM:**

- **Structured project summary:** e.g. JSON or a short structured prompt containing:
  - Investment range label, budget status (comfortable / tight / mismatch).
  - Archetype, style DNA title, essence, 2–3 signature notes, setting vibe.
  - One or two sentences summarizing scope/budget trade-offs (e.g. condensed from PM’s scope reasoning or professional reasoning).
  - Optional: number of rooms, key slots selected.
- **Instructions:** “Write four short paragraphs for the Design Detail executive summary. Block 1: Targeting Your Investment Range. Block 2: Strategic Trade-offs (high-level scope and budget). Block 3: Matches Your Unique Style. Block 4: Intentional Selections. Tone: [brand]. Length: 2–4 sentences per block.”

**Output:** Four block bodies (or a structured object with `targetingInvestment`, `strategicTradeoffs`, `matchesStyle`, `intentionalSelections`) that the Studio Coordinator uses as `executiveSummary.blocks[].body` instead of template-filled text.

**Where it plugs in:**

- Today: `buildDesignConceptFromAgentOutput` and `buildPlaceholderDesignConcept` in `designConceptData.ts` build `blocks` from templates and `dna` / `pmOutput`.
- With LLM: After we have the full design concept data (selections, scope reasoning, style reasoning), call an API or Server Action (e.g. `generateSummaryBlocks(projectSummary)`) that returns the four bodies. The Design Concept page or the builder that creates `DesignConceptDetail` then sets `executiveSummary.blocks` from the LLM response (and still sets `investmentRangeLabel`, `styleDNATitle`, etc. from structured data).

**Fallback:** If the LLM call fails or is skipped, keep the current template-based summary so the UI always has content.

---

## 3. Implementation order and API shape

**Suggested order:**

1. **CD style reasoning (LLM)**  
   - Add an API route or Server Action that accepts selections + CD input and returns style reasoning per slot.  
   - After PM runs, call it and merge results into the payload used for the Decision Detail table.  
   - Update `buildDesignConceptFromAgentOutput` (or the store shape) so `styleReasoning` comes from this step.

2. **Design Detail summary (LLM)**  
   - Add an API route or Server Action that accepts the structured project summary and returns four block bodies.  
   - When building `DesignConceptDetail`, call it and use the returned bodies for `blocks`; keep non-LLM fields (e.g. investment range, style title) from existing logic.  
   - Add a fallback to current templates on failure or timeout.

**API / model choices:**

- Use a single provider (e.g. OpenAI, Anthropic) and one model (e.g. GPT-4o or Claude) for both style reasoning and summary.  
- Keep prompts in code or in a small config so they’re easy to tune.  
- Consider token limits: style reasoning can be one short paragraph per slot; summary blocks 2–4 sentences each.

---

## 4. Summary

| Touchpoint              | Purpose                         | When / where                         |
|-------------------------|----------------------------------|--------------------------------------|
| **CD style reasoning**   | Per-selection style explanation | After PM; merge into Decision Detail |
| **Summary blocks**      | Executive summary narrative     | When building Design Detail summary  |

Both are good candidates for an LLM. Implementing style reasoning first improves the Decision Detail table immediately; adding summary generation then makes the whole Design Detail section LLM-rendered in a consistent way.
