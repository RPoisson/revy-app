# LLM strategy: cost, swap-ability, and future use cases

Covers: (1) cost-effective model choice per task, (2) a nimble stack so you can swap models easily, (3) other LLM opportunities in Revy and the floorplan → 3D elevation flow.

---

## 1. Cost optimization: right model per task

Use the **cheapest model that still meets quality** for each task. Below is a task → model tier mapping you can implement with a single config layer.

| Task | Suggested tier | Example models | Rationale |
|------|----------------|----------------|-----------|
| **CD style reasoning** (short per-slot copy) | Fast / cheap | OpenAI `gpt-4o-mini`, Anthropic `haiku`, Google `gemini-2.0-flash` | Structured, repetitive output; 1–2 sentences per slot. No heavy reasoning. |
| **Design Detail summary** (four narrative blocks) | Mid | OpenAI `gpt-4o-mini` or `gpt-4o`, Anthropic `sonnet`, Gemini `gemini-1.5-pro` | Needs consistent tone and structure; slightly more nuance than style reasoning. |
| **Future: moodboard from floorplan** (interpret plan + materials → brief) | Mid–high | `gpt-4o` / Claude Sonnet / Gemini Pro | May need to reason over layout + materials; quality matters for user trust. |
| **Future: Render agent** (materials + floorplan → 3D specs) | Mid–high | Same as above, or dedicated “reasoning” model | Structured output (specs); correctness matters. |
| **Future: semantic product search** (embeddings) | Embedding-only | OpenAI `text-embedding-3-small`, Cohere `embed-v3`, Voyage | Embeddings are cheap; pick one and use a small/fast completion model for any rerank or explanation. |

**Practical rule:** Start with **one cheap/fast model** (e.g. `gpt-4o-mini` or Haiku) for both style reasoning and summary. If summary quality is weak, move only that task to a mid-tier model (e.g. `gpt-4o` or Sonnet). Keep style reasoning on the cheap model.

---

## 2. Future-proof stack: easy model swap

Use a **small abstraction** so business logic talks to “the LLM” and you swap providers/models via config.

### 2.1 Provider-agnostic interface

Define a single completion interface and implement it per provider. Your app only calls the interface.

```ts
// e.g. src/lib/llm/types.ts

export type LLMTaskId = "style_reasoning" | "summary_blocks" | "moodboard_brief" | "render_specs";

export interface LLMOptions {
  taskId?: LLMTaskId;   // optional: for task-specific model selection
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionResult {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export interface ICompletionProvider {
  complete(messages: CompletionMessage[], options?: LLMOptions): Promise<CompletionResult>;
}
```

### 2.2 Adapters + config per task

- **Adapters:** One file per provider that implements `ICompletionProvider` (e.g. `OpenAIProvider`, `AnthropicProvider`). Each adapter reads its own env (e.g. `OPENAI_API_KEY`) and maps to the provider’s SDK.
- **Config:** A small config (env or JSON) that says **per task** which provider and model to use, e.g.:

```ts
// e.g. src/lib/llm/config.ts

export const LLM_TASK_CONFIG: Record<LLMTaskId, { provider: "openai" | "anthropic" | "google"; model: string }> = {
  style_reasoning: { provider: "openai", model: "gpt-4o-mini" },
  summary_blocks: { provider: "openai", model: "gpt-4o-mini" },
  moodboard_brief: { provider: "openai", model: "gpt-4o" },
  render_specs: { provider: "anthropic", model: "claude-sonnet-4-20250514" },
};
```

- **Factory:** `getCompletionProvider(taskId?: LLMTaskId)` returns the right adapter and, if you want, sets the model from `LLM_TASK_CONFIG[taskId]` so callers don’t care about provider or model name.

Then:

- **Swap model:** Change `LLM_TASK_CONFIG` (or env that feeds it).
- **Swap provider:** Add an adapter and point that task’s `provider` to it.
- **A/B test:** Factory can choose provider/model by experiment or user segment.

### 2.3 Where this lives

- **`src/lib/llm/`** (or `src/app/agents/llm/`): `types.ts`, `config.ts`, `openai.ts`, `anthropic.ts`, `index.ts` (factory + re-export).  
- **API routes / Server Actions** that need the LLM call `getCompletionProvider(taskId).complete(...)` and stay provider-agnostic.

---

## 3. Other ways to use LLMs in Revy

Beyond CD style reasoning and Design Detail summary:

| Use case | What the LLM does | Where it fits |
|----------|-------------------|---------------|
| **Quiz follow-up / explanations** | After a quiz answer, optional 1–2 sentence explanation of why that choice matters for their design. | Quiz result or tooltip. |
| **Recommendation rationale** | Short “why we recommend this” for a product or room, beyond the Decision Detail table. | Product cards, room summary. |
| **Semantic product search** | Embed product catalog + query; use LLM only for rerank or a one-line explanation. | CD candidate retrieval (Supabase + pgvector + optional LLM). |
| **Natural-language adjustments** | User says “warmer finishes in the kitchen”; LLM parses intent and returns structured constraints for CD/PM. | “Change this” / adjustment flow. |
| **Moodboard from floorplan** | Interpret floorplan (image + optional text) + selected materials → structured brief or scene description for the next step. | After “Render Designs” from Decision Detail. |
| **Render agent (3D specs)** | Input: materials (from Decision Detail/moodboards), room/floorplan context. Output: structured 3D elevation specs (materials, placements, style hints) for your renderer. | Step between “Render Designs” and the 3D pipeline. |

---

## 4. Floorplan → 3D elevations: how LLMs fit

You want: user adds floorplans → create 3D elevations that use the **materials from Decision Detail and moodboards**. You expect an LLM for the moodboard and a Render agent for 3D specs.

### 4.1 Flow (high level)

1. User is on **Decision Detail** (and has moodboards + selected materials).
2. User clicks **“Render Designs”** and uploads **floorplan(s)** (and optionally room labels or notes).
3. **Moodboard / brief step (LLM):**  
   Input: floorplan (image), room list, and **selected materials per room/slot** (from Decision Detail / moodboards).  
   Output: a **moodboard or scene brief** per room (or one structured document) that a renderer or 3D pipeline can use (e.g. “Primary bath: vanity X, tile Y, fixture Z; walls W; lighting L”).
4. **Render agent (LLM):**  
   Input: moodboard/brief + floorplan + any constraints (e.g. view angles, level of detail).  
   Output: **3D elevation specs** (structured: materials, placements, camera/view hints, style notes). Your actual 3D engine or external render service consumes these specs.

So:

- **One LLM** turns “floorplan + materials from Decision Detail” into a **moodboard / scene brief** (so the 3D step knows what to show where).
- **Another LLM (Render agent)** turns “brief + floorplan” into **3D specs** (so your stack is nimble and you can swap the 3D backend later).

### 4.2 Why two steps

- **Moodboard/brief:** “What goes where” from the user’s choices (materials, rooms). Good for validation (user sees a text/image summary before 3D) and for feeding the Render agent.
- **Render agent:** “How to build the 3D scene” (specs for your renderer). Keeps 3D logic and format in one place; you can change the 3D engine without changing how you produce the brief.

### 4.3 Model choice for this flow

- **Moodboard from floorplan:** Can be **multimodal** (image + text). Use a mid-tier model with vision (e.g. GPT-4o, Claude with image, Gemini). Cost: moderate; quality matters so the 3D step gets the right materials and rooms.
- **Render agent (3D specs):** Can be **text-only** (input = brief + floorplan description or structured data). Use a model good at structured output (JSON spec). Mid-tier is enough if the spec schema is clear; use a stronger model if the spec is complex or you add more reasoning.

### 4.4 Future-proofing the 3D step

- Define a **Render Spec** schema (e.g. TypeScript type / JSON Schema): rooms, materials per surface, camera/view hints, style flags.
- Render agent’s only job: fill that schema. Your 3D pipeline (or different backends) consume the schema. If you change 3D providers, you only adapt the consumer of the spec, not the LLM contract.

---

## 5. Summary

| Question | Answer |
|----------|--------|
| **1) Most cost-effective model per task?** | Use a **task → model config**: cheap/fast (e.g. gpt-4o-mini / Haiku) for style reasoning and optionally summary; mid for summary if needed; mid–high for moodboard + Render agent. Keep embeddings on a dedicated cheap embedding model. |
| **2) Nimble stack, easy to swap models?** | Add a **provider-agnostic completion interface** (`ICompletionProvider`), **adapters** per provider, and **per-task config** (provider + model). App calls the interface; swapping is a config change. |
| **3) Other LLM uses + floorplan/3D?** | Other uses: quiz explanations, recommendation rationale, semantic search + optional LLM, natural-language adjustments. For floorplan → 3D: **LLM 1** = floorplan + Decision Detail materials → **moodboard/scene brief**; **LLM 2 (Render agent)** = brief + floorplan → **3D elevation specs**. Define a Render Spec schema so the 3D backend can be swapped without changing the agent. |

I can next draft the actual `ICompletionProvider` + config and one adapter (e.g. OpenAI) in your repo under `src/lib/llm/` and wire one task (e.g. style reasoning) to it if you want to implement this now.
