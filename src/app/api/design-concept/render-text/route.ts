// POST: generate style reasoning per slot and four summary blocks using a lightweight LLM.
// Body: { selectionsBySlot, styleContext, summaryContext }
// Returns: { styleReasoningBySlot, summaryBlocks }

import { NextResponse } from "next/server";
import { completeWithOpenAI } from "@/lib/llm";

type SelectionPayload = {
  product: { title?: string; material?: string; finish?: string; slotId?: string };
  scopeReasoning: string;
};

type StyleContext = {
  primaryArchetype: string;
  essence: string;
  signatureNotes: string[];
  settingVibe: string;
};

type SummaryContext = {
  investmentRangeLabel: string;
  budgetStatus: string;
  styleDNATitle: string;
  strategicTradeoffsSummary: string;
};

function buildStyleReasoningPrompt(
  selectionsBySlot: Record<string, SelectionPayload>,
  styleContext: StyleContext
): string {
  const slots = Object.entries(selectionsBySlot).map(([key, sel]) => {
    const p = sel.product;
    return `- "${key}": ${p.title ?? "Product"} (material: ${p.material ?? "—"}, finish: ${p.finish ?? "—"})`;
  });
  return `You are a design writer for a residential renovation app. The user's style is: ${styleContext.primaryArchetype}. ${styleContext.essence} Key themes: ${(styleContext.signatureNotes ?? []).slice(0, 3).join(", ")}. Setting vibe: ${styleContext.settingVibe}.

For each selection below, write ONE short sentence (under 25 words) explaining why this product fits the user's style. Be specific to the product and the style. No generic phrases.

Selections:
${slots.join("\n")}

Respond with a JSON object only: keys are the slot keys (e.g. "lighting", "hardware"), values are the one-sentence style reasoning. Example: {"lighting": "The aged brass and simple lines align with your Provincial look—warm and understated.", "hardware": "..."}`;
}

function buildSummaryBlocksPrompt(summaryContext: SummaryContext): string {
  return `You are a design writer for a residential renovation app. Generate exactly four short paragraphs for the Design Detail executive summary. Use a warm, professional tone. Each paragraph should be 2-4 sentences.

Context:
- Investment range: ${summaryContext.investmentRangeLabel}. Budget status: ${summaryContext.budgetStatus}.
- Style: ${summaryContext.styleDNATitle}.
- Scope/budget summary: ${summaryContext.strategicTradeoffsSummary}

Return a JSON object with one key "blocks", which is an array of exactly 4 objects. Each object has "title" and "body". Use these exact titles in order:
1. "Targeting Your Investment Range"
2. "Strategic Trade-offs"
3. "Matches Your Unique Style"
4. "Intentional Selections"

For "Targeting Your Investment Range": focus on how selections align with the investment range and budget status.
For "Strategic Trade-offs": high-level summary of scope and budget decisions; reference the Decision Detail table below for specifics.
For "Matches Your Unique Style": reflect the user's style (${summaryContext.styleDNATitle}) and how the selections reinforce it.
For "Intentional Selections": every selection is driven by the project's style and scope logic; the Decision Detail table outlines the reasoning.

Respond with the JSON object only, no markdown.`;
}

function parseStyleReasoningResponse(content: string): Record<string, string> {
  const trimmed = content.trim().replace(/^```json\s*|\s*```$/g, "");
  const parsed = JSON.parse(trimmed) as Record<string, string>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

function parseSummaryBlocksResponse(content: string): { title: string; body: string }[] {
  const trimmed = content.trim().replace(/^```json\s*|\s*```$/g, "");
  const parsed = JSON.parse(trimmed) as { blocks?: { title: string; body: string }[] };
  const blocks = parsed?.blocks;
  if (!Array.isArray(blocks) || blocks.length < 4) {
    throw new Error("Expected 4 summary blocks");
  }
  const titles = [
    "Targeting Your Investment Range",
    "Strategic Trade-offs",
    "Matches Your Unique Style",
    "Intentional Selections",
  ];
  return blocks.slice(0, 4).map((b, i) => ({
    title: titles[i] ?? b.title ?? "",
    body: typeof b.body === "string" ? b.body : "",
  }));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      selectionsBySlot?: Record<string, SelectionPayload>;
      styleContext?: StyleContext;
      summaryContext?: SummaryContext;
    };

    const selectionsBySlot = body.selectionsBySlot ?? {};
    const styleContext = body.styleContext;
    const summaryContext = body.summaryContext;

    const styleReasoningBySlot: Record<string, string> = {};
    let summaryBlocks: { title: string; body: string }[] = [];

    if (styleContext && Object.keys(selectionsBySlot).length > 0) {
      const stylePrompt = buildStyleReasoningPrompt(selectionsBySlot, styleContext);
      const styleResult = await completeWithOpenAI(
        [{ role: "user", content: stylePrompt }],
        { taskId: "style_reasoning", maxTokens: 800, temperature: 0.4 }
      );
      const parsed = parseStyleReasoningResponse(styleResult.content);
      Object.assign(styleReasoningBySlot, parsed);
    }

    if (summaryContext) {
      const summaryPrompt = buildSummaryBlocksPrompt(summaryContext);
      const summaryResult = await completeWithOpenAI(
        [{ role: "user", content: summaryPrompt }],
        { taskId: "summary_blocks", maxTokens: 1024, temperature: 0.4 }
      );
      summaryBlocks = parseSummaryBlocksResponse(summaryResult.content);
    }

    return NextResponse.json({
      styleReasoningBySlot,
      summaryBlocks,
    });
  } catch (err) {
    console.error("[render-text] LLM error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate text" },
      { status: 500 }
    );
  }
}
