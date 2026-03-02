// Per-task model config: swap provider/model here without changing call sites.

import type { LLMTaskId } from "./types";

export const LLM_TASK_CONFIG: Record<
  LLMTaskId,
  { provider: "openai"; model: string }
> = {
  style_reasoning: { provider: "openai", model: "gpt-4o-mini" },
  summary_blocks: { provider: "openai", model: "gpt-4o-mini" },
};

export const DEFAULT_MAX_TOKENS = 1024;
export const DEFAULT_TEMPERATURE = 0.4;
