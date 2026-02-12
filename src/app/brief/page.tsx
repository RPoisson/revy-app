// src/app/brief/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAnswers,
  clearAnswers,
  QuizAnswers,
} from "@/app/quiz/lib/answersStore";
import { scoreQuiz } from "@/app/scoring";
import { generateResultText } from "@/app/resultText";

import {
  getDesignDirectionForExterior,
  getExteriorLabel,
} from "@/app/brief/designDirectionByExterior";

import { SCOPE_QUESTIONS } from "@/app/quiz/scope/questions";
import { BUDGET_QUESTIONS } from "@/app/quiz/budget/questions";

// ✅ Import your full question set (material_palette lives here)
import { QUESTIONS } from "@/questions";
import type { Question } from "@/questions";

// ✅ rule renderer + rule data
import { RuleOutput } from "@/components/RuleOutput";
import { FS_01 } from "@/data/rules/fs-01";
import { FS_02 } from "@/data/rules/fs-02";
import { BU_01 } from "@/data/rules/bu-01";
import { BU_02 } from "@/data/rules/bu-02";
import { BU_03 } from "@/data/rules/bu-03";
import { FN_01 } from "@/data/rules/fn-01";
import { FN_02 } from "@/data/rules/fn-02";

// ✅ budget heuristics (V1)
import {
  computeBudgetFit,
  computeComplexityPoints,
  getBudgetCapacityPoints,
} from "@/app/brief/budgetHeuristics";

function first(answers: QuizAnswers, key: string): string | undefined {
  const v = answers[key];
  if (!v || v.length === 0) return undefined;
  return v[0];
}

function list(answers: QuizAnswers, key: string): string[] {
  return answers[key] ?? [];
}

function buildLabelIndex(questions: Question[]) {
  const map = new Map<string, Map<string, { label: string; subtitle?: string }>>();
  for (const q of questions) {
    const optMap = new Map<string, { label: string; subtitle?: string }>();
    for (const opt of q.options) {
      optMap.set(opt.id, { label: opt.label, subtitle: opt.subtitle });
    }
    map.set(q.id, optMap);
  }
  return map;
}

function resolveOne(
  answers: QuizAnswers,
  labelIndex: ReturnType<typeof buildLabelIndex>,
  qid: string
): { label?: string; subtitle?: string } {
  const id = first(answers, qid);
  if (!id) return {};
  const optMap = labelIndex.get(qid);
  return optMap?.get(id) ?? {};
}

function resolveMany(
  answers: QuizAnswers,
  labelIndex: ReturnType<typeof buildLabelIndex>,
  qid: string
): { labels: string[]; subtitles: (string | undefined)[] } {
  const ids = list(answers, qid);
  if (!ids.length) return { labels: [], subtitles: [] };

  const optMap = labelIndex.get(qid);
  const labels: string[] = [];
  const subtitles: (string | undefined)[] = [];

  for (const id of ids) {
    const hit = optMap?.get(id);
    if (hit) {
      labels.push(hit.label);
      subtitles.push(hit.subtitle);
    }
  }

  return { labels, subtitles };
}

function dashIfEmpty(v?: string) {
  return v && v.trim().length ? v : "—";
}

import type { RevyRule } from "@/types/rules";

function asArray(r: RevyRule | RevyRule[] | undefined | null): RevyRule[] {
  if (!r) return [];
  return Array.isArray(r) ? r : [r];
}

/**
 * Minimal trigger evaluator for rule strings like:
 * - "ownership_mode == rental"
 * - "finish_level == builder_plus AND budget_fit == aligned AND remodel_complexity_score >= 60"
 *
 * Supported:
 * AND / OR, ==, !=, >=, <=, >, <, "=" (alias of "==")
 * include / includes / contains  (array membership; e.g. "rooms include kitchen")
 *
 * Notes:
 * - Bare tokens treated as strings (e.g. rental, mid, builder_plus).
 * - Special-cases "rooms include bathroom" to match any room id containing "bath".
 */
function evalSimpleTrigger(expr: string, ctx: Record<string, any>): boolean {
  const tokens = expr.replace(/\s+/g, " ").trim().split(" ");

  const readValue = (t: string) => {
    if (t in ctx) return ctx[t];
    const n = Number(t);
    if (!Number.isNaN(n)) return n;
    return t; // treat bare tokens as strings
  };

  const asArraySafe = (v: any): any[] => {
    if (Array.isArray(v)) return v;
    if (v == null) return [];
    return [v];
  };

  const evalComparison = (left: string, opRaw: string, right: string) => {
    const op = opRaw === "=" ? "==" : opRaw;

    const a = readValue(left);
    const b = readValue(right);

    // Array membership: rooms include kitchen
    if (op === "include" || op === "includes" || op === "contains") {
      const arr = asArraySafe(a).map(String);

      // Special keyword: "bathroom" -> any room id containing "bath"
      if (String(right).toLowerCase() === "bathroom") {
        return arr.some((x) => x.includes("bath"));
      }

      return arr.includes(String(b));
    }

    switch (op) {
      case "==":
        return String(a) === String(b);
      case "!=":
        return String(a) !== String(b);
      case ">=":
        return Number(a) >= Number(b);
      case "<=":
        return Number(a) <= Number(b);
      case ">":
        return Number(a) > Number(b);
      case "<":
        return Number(a) < Number(b);
      default:
        return false;
    }
  };

  // Evaluate left-to-right with AND precedence over OR.
  const parts: (boolean | "AND" | "OR")[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "AND" || t === "OR") {
      parts.push(t);
      continue;
    }

    const left = tokens[i];
    const op = tokens[i + 1];
    const right = tokens[i + 2];
    if (!left || !op || !right) break;

    parts.push(evalComparison(left, op, right));
    i += 2;
  }

  // Reduce ANDs first
  const andReduced: (boolean | "OR")[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === "AND") {
      const prev = andReduced.pop();
      const next = parts[i + 1];
      if (typeof prev === "boolean" && typeof next === "boolean") {
        andReduced.push(prev && next);
        i += 1;
      } else {
        andReduced.push(false);
      }
    } else {
      andReduced.push(p as any);
    }
  }

  // Reduce ORs
  let result = false;
  for (const p of andReduced) {
    if (p === "OR") continue;
    result = result || Boolean(p);
  }
  return result;
}

export default function BriefPage() {
  const router = useRouter();

  // IMPORTANT: null until client loads answers (prevents hydration mismatch)
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);

  useEffect(() => {
    setAnswers(getAnswers());
  }, []);

  const scopeIndex = useMemo(() => buildLabelIndex(SCOPE_QUESTIONS), []);
  const budgetIndex = useMemo(() => buildLabelIndex(BUDGET_QUESTIONS), []);

  // ✅ Master index built from src/questions.ts so we can resolve material_palette (and any future global questions)
  const masterIndex = useMemo(() => buildLabelIndex(QUESTIONS), []);

  // 1) First paint: stable loading state
  if (answers === null) {
    return (
      <main className="min-h-screen flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-md text-center space-y-3">
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Studio Rêvy™
          </p>
          <h1 className="font-[var(--font-playfair)] text-xl">
            Preparing your brief…
          </h1>
          <p className="text-sm text-black/70 leading-relaxed">
            Pulling together your scope, investment range, and taste.
          </p>
        </div>
      </main>
    );
  }

  const hasAnyAnswers = Object.keys(answers).length > 0;

  // 2) If still empty after loading, show “no project found”
  if (!hasAnyAnswers) {
    return (
      <main className="min-h-screen flex justify-center items-center px-4 py-10">
        <div className="w-full max-w-md text-center space-y-4">
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Studio Rêvy™
          </p>
          <h1 className="font-[var(--font-playfair)] text-xl">
            No project found
          </h1>
          <p className="text-sm text-black/70 leading-relaxed">
            Start the quiz to generate your Design Direction Summary.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide hover:bg-black/90 transition"
          >
            Start a project
          </button>
        </div>
      </main>
    );
  }

  // Exterior
  const exteriorId = first(answers, "home_exterior_style");
  const exteriorLabel = getExteriorLabel(exteriorId) ?? "—";
  const designDirection =
    getDesignDirectionForExterior(exteriorId) ??
    "Design direction will be generated once your exterior style is selected.";

  // Scope labels (for snapshot UI)
  const projectFor = resolveOne(answers, scopeIndex, "project_for").label;
  // NOTE: decision_makers is currently commented out in SCOPE_QUESTIONS; keep safe.
  const decisionMakers = resolveOne(answers, scopeIndex, "decision_makers").label;

  const occupancy = resolveOne(answers, scopeIndex, "occupancy").label;
  const startTiming = resolveOne(answers, scopeIndex, "start_timing").label;
  const completionTiming = resolveOne(answers, scopeIndex, "completion_timing").label;
  const timelineFlex = resolveOne(answers, scopeIndex, "timeline_flexibility").label;

  const scopeLevel = resolveOne(answers, scopeIndex, "scope_level");
  // NOTE: lead_time_sensitivity is commented out; keep safe.
  const leadTime = resolveOne(answers, scopeIndex, "lead_time_sensitivity");
const roomIds = list(answers, "rooms");
const rooms = (() => {
  const optMap = scopeIndex.get("rooms");
  return roomIds
    .map((id) => {
      const label = optMap?.get(id)?.label ?? id;
      const qty = first(answers, `rooms_qty_${id}`);
      if (!qty) return label;
      const prettyQty = qty === "7_plus" ? "7+" : qty;
      return `${label} (${prettyQty})`;
    })
    .filter(Boolean);
})();

  // Budget labels (for snapshot UI)
  const investmentRange = resolveOne(answers, budgetIndex, "investment_range").label;
  const rangeFlex = resolveOne(answers, budgetIndex, "range_flexibility");

  const finishLevel = resolveOne(answers, budgetIndex, "finish_level");
  const splurgeAreas = resolveMany(answers, budgetIndex, "splurge_areas").labels;

  // FCH style result (existing algo)
  const styleResult = scoreQuiz(answers as any);
  const fch = generateResultText(styleResult as any, answers as any);

  // ✅ Resolve palette from master index (src/questions.ts), not scopeIndex
const colorMood = resolveOne(answers, masterIndex, "color_mood").label;


  // ✅ Budget fit (V1 heuristic)
  const capacity = getBudgetCapacityPoints(answers);
  const complexity = computeComplexityPoints(answers);
  const budgetFit = capacity ? computeBudgetFit(complexity, capacity) : null;

  // ✅ Rules to render (V1) — NOW ACTUALLY FILTERS BASE RULES BY triggerLogic
  const revyRules = (() => {
    const base: RevyRule[] = [
      ...asArray(FS_01),
      ...asArray(FS_02),
      ...asArray(BU_01),
      ...asArray(BU_02),
      ...asArray(BU_03),
      ...asArray(FN_02)

    ];

    const projectForId = first(answers, "project_for"); // live_in | rental | flip

    const ctx = {
      // FN rules
      ownership_mode: projectForId,
      ownership_intent: projectForId === "live_in" ? "live" : "rental",

      // Budget rules
      investment_range: first(answers, "investment_range"),
      finish_level: first(answers, "finish_level"),
      remodel_complexity_score: complexity,
      budget_fit: budgetFit ?? "unknown",

      // Feasibility/scope rules like FS-01
      occupancy: first(answers, "occupancy"), // full_time | not_living_there | living_unsure
      scope_level: first(answers, "scope_level"),
      rooms: list(answers, "rooms"),
    };

    const baseApplicable = base.filter((r) => {
      if (!r?.triggerLogic) return true; // if no trigger, show by default
      return evalSimpleTrigger(r.triggerLogic, ctx);
    });

    const fn01Applicable = FN_01.filter((r) => {
      if (!r?.triggerLogic) return false;
      return evalSimpleTrigger(r.triggerLogic, ctx);
    });

    return [...baseApplicable, ...fn01Applicable];
  })();

  return (
    <main className="min-h-screen flex justify-center px-4 pt-8 pb-24 md:py-12">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <header className="space-y-2">
          <p className="text-xs tracking-[0.2em] uppercase text-black/50">
            Studio Rêvy™
          </p>
          <h1 className="font-[var(--font-playfair)] text-2xl md:text-3xl leading-snug">
            Project Design Summary
          </h1>
          <p className="text-sm text-black/70 leading-relaxed">
            Built from your scope, investment range, constraints, and taste.
          </p>
        </header>

        {/* Project Snapshot */}
        <section className="rounded-2xl border border-black/10 bg-white/60 p-5 md:p-6 space-y-5">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
            Project snapshot
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Home is for
              </div>
              <div className="mt-1 text-black/80">{dashIfEmpty(projectFor)}</div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Living in home during project
              </div>
              <div className="mt-1 text-black/80">{dashIfEmpty(occupancy)}</div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Start timing
              </div>
              <div className="mt-1 text-black/80">{dashIfEmpty(startTiming)}</div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Project completion target
              </div>
              <div className="mt-1 text-black/80">
                {dashIfEmpty(completionTiming)}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Timeline flexibility
              </div>
              <div className="mt-1 text-black/80">{dashIfEmpty(timelineFlex)}</div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Level of work
              </div>
              <div className="mt-1 text-black/80">
                {dashIfEmpty(scopeLevel.label)}
                {scopeLevel.subtitle ? (
                  <span className="text-black/60"> — {scopeLevel.subtitle}</span>
                ) : null}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Rooms
              </div>
              <div className="mt-1 text-black/80">
                {rooms.length ? rooms.join(" · ") : "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Investment range
              </div>
              <div className="mt-1 text-black/80">
                {dashIfEmpty(investmentRange)}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Range flexibility
              </div>
              <div className="mt-1 text-black/80">
                {dashIfEmpty(rangeFlex.label)}
                {rangeFlex.subtitle ? (
                  <span className="text-black/60"> — {rangeFlex.subtitle}</span>
                ) : null}
              </div>
            </div>

            
         

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Finish level
              </div>
              <div className="mt-1 text-black/80">
                {dashIfEmpty(finishLevel.label)}
                {finishLevel.subtitle ? (
                  <span className="text-black/60"> — {finishLevel.subtitle}</span>
                ) : null}
              </div>
            </div>

            
          </div>
        </section>

        {/* Design Direction */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
            Rêvy design direction
          </h2>
          <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
            Home exterior: <span className="text-black/70">{exteriorLabel}</span>
          </div>
          <p className="text-sm leading-relaxed text-black/80">{designDirection}</p>
        </section>

        {/* FCH Style */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
            What’s your French California Home style?
          </h2>

          <div className="rounded-2xl border border-black/10 bg-white/60 p-5 md:p-6 space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Style name
              </div>
              <div className="mt-1 font-[var(--font-playfair)] text-lg text-black">
                {fch.title}
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                Description
              </div>
              <p className="mt-1 text-sm leading-relaxed text-black/80">
                {fch.description}
              </p>
            </div>

            <div>
  <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
    Ideal color mood
  </div>
  <div className="mt-1 text-sm text-black/80">
    {dashIfEmpty(colorMood)}
  </div>
</div>

          </div>
        </section>

        {/* Rêvy recommends */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-black/50">
            Rêvy recommends
          </h2>
<p className="text-xs text-black/60 leading-relaxed">
  Each recommendation is framed through one of three lenses—<strong>Feasibility</strong>,
  <strong> Budget</strong>, or <strong>Finish Strategy</strong>—so you know whether it’s about
  build realities given your constraints, investment alignment based on your scope, or where to best focus your design spend.
</p>

          <div className="space-y-4">
            {revyRules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-2xl border border-black/10 bg-white/60 p-5 md:p-6"
              >
                <RuleOutput rule={rule} />
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <button
            onClick={() => router.push("/quiz/scope")}
            className="text-xs md:text-sm px-5 py-2 rounded-full border border-black/20 bg-transparent hover:bg-black/5 transition"
          >
            Edit answers
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => {
                clearAnswers();
                router.push("/");
              }}
              className="text-xs md:text-sm px-5 py-2 rounded-full border border-black/20 bg-transparent hover:bg-black/5 transition"
            >
              Start a new project
            </button>

            <button
              onClick={() => window.print()}
              className="text-xs md:text-sm px-6 py-2 rounded-full bg-black text-[#F8F5EE] hover:bg-black/90 transition"
            >
              Save / print
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
