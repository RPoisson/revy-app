"use client";

import { useMemo } from "react";
import {
  buildPlaceholderDesignConcept,
} from "../designConceptData";
import type { ArchetypeId } from "@/app/style/styleDNA";
import { SectionHeader, CARD_STYLE } from "../components/SectionHeader";

const PLACEHOLDER_ARCHETYPE: ArchetypeId = "provincial";
const PLACEHOLDER_INVESTMENT_LABEL = "$200k–$350k";

export default function ExecutiveSummaryPage() {
  const data = useMemo(
    () => buildPlaceholderDesignConcept(PLACEHOLDER_ARCHETYPE, PLACEHOLDER_INVESTMENT_LABEL),
    []
  );
  const { executiveSummary } = data;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">
      <SectionHeader
        number="01"
        title="Executive Summary"
        subtitle="The strategic rationale driving every design decision."
      />
      <div
        className="w-full max-w-[1000px] mx-auto flex flex-col"
        style={{
          ...CARD_STYLE,
          aspectRatio: "3 / 2",
          padding: 0,
        }}
      >
        <div className="flex-1 grid grid-cols-2 gap-0 pt-8 sm:pt-10 pb-8 sm:pb-10">
          {executiveSummary.blocks.map((block, i) => {
            const isTop = i < 2;
            const isLeft = i % 2 === 0;
            return (
              <div
                key={block.title}
                className="px-6 sm:px-10 py-6 sm:py-8 flex flex-col"
                style={{
                  borderRight: isLeft ? "1px solid rgba(17,17,17,0.08)" : undefined,
                  borderBottom: isTop ? "1px solid rgba(17,17,17,0.08)" : undefined,
                }}
              >
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-black/50 mb-2">
                  0{i + 1}
                </span>
                <h4 className="font-[var(--font-playfair)] text-base font-semibold text-black mb-3">
                  {block.title}
                </h4>
                <p className="text-sm leading-relaxed text-black/70">
                  {block.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
