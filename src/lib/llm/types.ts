// Lightweight LLM abstraction: task-based model selection, provider-agnostic interface.

export type LLMTaskId = "style_reasoning" | "summary_blocks";

export interface LLMOptions {
  taskId?: LLMTaskId;
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
