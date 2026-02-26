// revy-quiz/src/components/RuleOutput.tsx
"use client";

import React from "react";
import type { RevyRule } from "@/types/rules";

function BadgeIcon({ icon }: { icon: "check" | "warning" | "info" }) {
  if (icon === "check") return <span aria-hidden>✅</span>;
  if (icon === "warning") return <span aria-hidden>⚠️</span>;
  return <span aria-hidden>ℹ️</span>;
}

type ChipTone = "neutral" | "warning" | "positive";

type ChipKind = "feasibility" | "budget" | "finish_strategy" | "recommendation";

function categoryChipLabel(category?: string) {
  if (!category) return "Recommendation";

  // "Budget · Risk" -> "Budget"
  // "Feasibility · Sequencing · Liveability Risk" -> "Feasibility"
  // "Finish · Strategy" -> "Finish Strategy"
  const base = category.split("·")[0].trim();

  if (base.toLowerCase() === "finish") return "Finish Strategy";

  return base || "Recommendation";
}

function chipKindFromCategory(category?: string): ChipKind {
  if (!category) return "recommendation";
  const base = category.split("·")[0].trim().toLowerCase();

  if (base.includes("feasibility")) return "feasibility";
  if (base.includes("budget")) return "budget";
  if (base.includes("finish")) return "finish_strategy";

  return "recommendation";
}

function chipTooltipFromKind(kind: ChipKind): string {
  switch (kind) {
    case "feasibility":
      return "Construction realities, sequencing, or livability risks that affect how this can be built.";
    case "budget":
      return "How your scope and finish ambition align with your investment range.";
    case "finish_strategy":
      return "Where to invest, where to stay restrained, and how to place personality intelligently.";
    default:
      return "A tailored recommendation based on your answers.";
  }
}

function chipToneFromCategory(category?: string): ChipTone {
  const c = (category ?? "").toLowerCase();
  if (c.includes("risk") || c.includes("feasibility")) return "warning";
  if (c.includes("budget")) return "neutral";
  // Keep Finish Strategy neutral for V1 (can switch to "positive" later if desired)
  return "neutral";
}

function Chip({
  label,
  tone = "neutral",
  tooltip,
}: {
  label: string;
  tone?: ChipTone;
  tooltip?: string;
}) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] tracking-[0.12em] uppercase border";
  const styles =
    tone === "warning"
      ? "border-black/20 text-black/70 bg-black/5"
      : tone === "positive"
      ? "border-black/15 text-black/70 bg-white/70"
      : "border-black/15 text-black/60 bg-white/60";

  // Native tooltip (works on hover; appears on long-press in many mobile browsers).
  // Also add aria-label for screen readers.
  return (
    <span
      className={`${base} ${styles}`}
      title={tooltip}
      aria-label={tooltip ? `${label}. ${tooltip}` : label}
    >
      {label}
    </span>
  );
}

export function RuleOutput({ rule }: { rule: RevyRule }) {
  const chipLabel = categoryChipLabel(rule.category);
  const chipTone = chipToneFromCategory(rule.category);
  const chipKind = chipKindFromCategory(rule.category);
  const chipTooltip = chipTooltipFromKind(chipKind);

  return (
    <section className="space-y-4">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Chip label={chipLabel} tone={chipTone} tooltip={chipTooltip} />
        </div>

        <h3 className="font-[var(--font-playfair)] text-lg md:text-xl text-black leading-snug">
          {rule.name}
        </h3>

        <div className="rounded-2xl border border-black/10 bg-white/60 p-4 space-y-1">
          <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
            Recommendation
          </div>
          {/* Keep consistent sizing with other body text */}
          <div className="text-sm text-black/80 leading-relaxed">
            {rule.primaryRecommendation}
          </div>
        </div>
      </header>

      {/* Why this is showing */}
      {rule.whyShowing ? (
        <div className="rounded-2xl border border-black/10 bg-white/60 p-4 space-y-1">
          <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
            Why you’re seeing this
          </div>
          <div className="text-sm text-black/70 leading-relaxed">
            {rule.whyShowing}
          </div>
        </div>
      ) : null}

      {/* Light scope reassurance */}
      {rule.lightScopeNote ? (
        <div className="rounded-2xl border border-black/10 bg-white/60 p-4 space-y-1">
          <div className="flex items-center gap-2">
            <span aria-hidden>✅</span>
            <div className="text-sm font-semibold text-black/90">
              May be low impact
            </div>
          </div>
          <div className="text-sm text-black/70 leading-relaxed">
            {rule.lightScopeNote}
          </div>
        </div>
      ) : null}

      {/* Badges */}
      {rule.badges?.length ? (
        <div className="space-y-2">
          {rule.badges.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-black/10 bg-white/60 p-4 space-y-1"
            >
              <div className="flex items-center gap-2">
                <BadgeIcon icon={b.icon} />
                <div className="text-sm font-semibold text-black/90">
                  {b.title}
                </div>
              </div>
              <div className="text-sm text-black/70 leading-relaxed">{b.text}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Always-visible constraints */}
      {rule.alwaysVisibleConstraints?.length ? (
        <div className="rounded-2xl border border-black/10 bg-white/60 p-4 space-y-2">
          <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
            Key constraints
          </div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-black/80">
            {rule.alwaysVisibleConstraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Collapsible sections */}
      {rule.sections?.length ? (
        <div className="space-y-2">
          {rule.sections.map((s) => (
            <details
              key={s.id}
              className="rounded-2xl border border-black/10 bg-white/60 p-4"
            >
              <summary className="cursor-pointer text-sm font-semibold text-black/90">
                {s.title}
              </summary>

              <div className="mt-3 space-y-4">
                {s.whyThisMatters ? (
                  <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                      Why this matters
                    </div>
                    <div className="text-sm text-black/70 leading-relaxed">
                      {s.whyThisMatters}
                    </div>
                  </div>
                ) : null}

                {s.subsections?.map((sub, subIdx) => (
                  <div
                    key={`${s.title}::${sub.title}::${subIdx}`}
                    className="space-y-2"
                  >
                    <div className="text-xs font-semibold tracking-wide text-black/80">
                      {sub.title}
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-black/70">
                      {sub.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {s.advisory ? (
                  <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-4 space-y-1">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-black/50">
                      Advisory
                    </div>
                    <div className="text-sm text-black/70 leading-relaxed">
                      {s.advisory}
                    </div>
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
}
