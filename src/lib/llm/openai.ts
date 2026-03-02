// OpenAI adapter for completion. Uses LLM_TASK_CONFIG for model per task.

import OpenAI from "openai";
import type { CompletionMessage, CompletionResult, LLMOptions } from "./types";
import { LLM_TASK_CONFIG, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from "./config";

function getClient(): OpenAI {
  const key = (process.env.OPENAI_API_KEY ?? process.env.OPEN_API_KEY)?.trim();
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

export async function completeWithOpenAI(
  messages: CompletionMessage[],
  options?: LLMOptions
): Promise<CompletionResult> {
  const taskId = options?.taskId ?? "style_reasoning";
  const config = LLM_TASK_CONFIG[taskId];
  const model = config.model;

  const client = getClient();
  const response = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
    temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
  });

  const choice = response.choices?.[0];
  const content = choice?.message?.content?.trim() ?? "";
  const usage = response.usage
    ? { promptTokens: response.usage.prompt_tokens, completionTokens: response.usage.completion_tokens }
    : undefined;

  return { content, usage };
}
