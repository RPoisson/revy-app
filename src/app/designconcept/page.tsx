// src/app/designconcept/page.tsx
// Studio Coordinator Agent — Design Concept Detail. Visual design ported from
// Lovable "Interior Moodboard Studio" (moodboard-architect); no Slot Editor.

"use client";

import Image from "next/image";
import { useMemo } from "react";
import { StudioLogo } from "@/components/StudioLogo";
import {
  buildPlaceholderDesignConcept,
  type DesignConceptDetail,
  type MoodboardAspectRatio,
} from "./designConceptData";
import type { ArchetypeId } from "@/app/style/styleDNA";

const PLACEHOLDER_ARCHETYPE: ArchetypeId = "provincial";
const PLACEHOLDER_INVESTMENT_LABEL = "$200k–$350k";

// Lovable-style card: white, soft border, shadow
const CARD_STYLE = {
  background: "#ffffff",
  border: "1px solid rgba(17,17,17,0.10)",
  borderRadius: 18,
  boxShadow: "0 10px 24px rgba(17,17,17,0.06)",
} as const;

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="w-full max-w-[1000px] mx-auto mb-6">
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-black/50">
          {number}
        </span>
        <div
          className="flex-1 border-b border-black/10"
          style={{ transform: "translateY(-4px)" }}
        />
      </div>
      <h2 className="font-[var(--font-playfair)] text-2xl md:text-3xl font-semibold text-black tracking-tight mt-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-black/60 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function aspectRatioClass(ratio: MoodboardAspectRatio): string {
  switch (ratio) {
    case "1:1":
      return "aspect-square";
    case "1.5:1":
      return "aspect-[3/2]";
    case "3:4":
      return "aspect-[3/4]";
    default:
      return "aspect-[3/2]";
  }
}

export default function DesignConceptPage() {
  const data: DesignConceptDetail = useMemo(
    () => buildPlaceholderDesignConcept(PLACEHOLDER_ARCHETYPE, PLACEHOLDER_INVESTMENT_LABEL),
    []
  );

  const { executiveSummary, moodboard, materials } = data;

  return (
    <main
      className="min-h-screen bg-[var(--background)]"
      data-design-concept-detail
      data-satori-root
    >
      <header className="border-b border-black/10 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <StudioLogo className="text-black/50" />
            <div className="flex items-baseline gap-3">
              <h1 className="font-[var(--font-playfair)] text-2xl font-bold tracking-tight text-black">
                Design Concept Brief
              </h1>
              <span className="text-xs text-black/50 tracking-wide uppercase hidden sm:inline">
                Rêvy Studio
              </span>
            </div>
          </div>
          <p className="text-sm text-black/60 mt-1">
            Executive summary · Moodboard · Decision detail
          </p>
        </div>
      </header>

      {/* ─── 01 Executive Summary (Lovable 2x2 narrative grid) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
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
          <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 border-b border-black/10">
            <h3 className="font-[var(--font-playfair)] text-xl sm:text-2xl font-semibold text-black tracking-tight">
              Design Concept Detail
            </h3>
            <p className="text-sm text-black/60 mt-1">
              A summary of the design rationale behind every selection.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-0">
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

      {/* ─── 02 Design Concept Moodboard (1.5:1, read-only; no Slot Editor) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <SectionHeader
          number="02"
          title="Design Concept Moodboard"
          subtitle="Visual material board — normalized aspect ratios, concept label, palette strip."
        />
        <div className="max-w-[1000px] mx-auto">
          <div className="w-full" style={{ ...CARD_STYLE, padding: 18 }}>
            <div
              className="relative w-full overflow-hidden rounded-[14px]"
              style={{
                aspectRatio: "1.5",
                background: "#f8f5ee",
              }}
            >
              {/* Image grid */}
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 grid grid-cols-3 gap-2 p-3">
                  {moodboard.images.map((img, i) => (
                    <div
                      key={i}
                      className={`relative overflow-hidden rounded-lg bg-black/5 ${aspectRatioClass(img.aspectRatio)}`}
                    >
                      <Image
                        src={img.src}
                        alt={img.conceptLabel ?? `Mood ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 200px"
                        unoptimized={img.src.startsWith("data:")}
                      />
                      {img.conceptLabel && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-2 py-1 truncate">
                          {img.conceptLabel}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Palette strip (Lovable: right edge) */}
                <div
                  className="absolute right-[3%] top-[10%] w-[10%] h-[62%] rounded-lg flex flex-col gap-[2%] p-[1.2%] box-border"
                  style={{
                    background: "#ffffff",
                    outline: "1px solid #ffffff",
                    boxShadow: "0 0 0 1px rgba(17,17,17,0.08)",
                  }}
                >
                  {moodboard.paletteStripColors.map((hex, i) => (
                    <div
                      key={i}
                      className="flex-1 min-h-0 rounded"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
                {/* Concept label (Lovable: bottom left inside canvas) */}
                <div
                  className="absolute bottom-[2%] left-[3.7%] right-[15%] pointer-events-none"
                >
                  <span className="font-[var(--font-playfair)] text-sm tracking-[0.2em] uppercase text-black/50">
                    {moodboard.conceptLabel} Concept
                  </span>
                  <div
                    className="mt-1 h-px w-full bg-black/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 03 Decision Detail (Style + Functional only; no Technical) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <SectionHeader
          number="03"
          title="Decision Detail"
          subtitle="Selection reasoning — Style and Functional logic for every material slot."
        />
        <div
          className="w-full max-w-[1000px] mx-auto overflow-hidden"
          style={CARD_STYLE}
        >
          <div className="px-6 sm:px-8 py-5 border-b border-black/10">
            <h4 className="font-[var(--font-playfair)] text-lg font-semibold text-black">
              Material slots
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black/5 text-left">
                  <th className="px-6 py-3 font-medium text-black/50 w-[100px]">Item</th>
                  <th className="px-4 py-3 font-medium text-black/50 w-[72px]">Image</th>
                  <th className="px-4 py-3 font-medium text-black/50 w-[220px]">Description</th>
                  <th className="px-4 py-3 font-medium text-black/50">Selection Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((row) => (
                  <tr
                    key={row.slotId}
                    className="border-t border-black/10 hover:bg-black/[0.02] transition-colors align-top"
                  >
                    <td className="px-6 py-4 font-medium text-black text-xs">
                      {row.slotTitle}
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-14 h-14 rounded-lg border border-black/10 overflow-hidden bg-black/5">
                        <Image
                          src={row.thumbnailUrl}
                          alt={row.slotTitle}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized={row.thumbnailUrl.startsWith("data:")}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-black/70 leading-relaxed">
                      {row.description}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-amber-100/80 text-amber-900">
                            Style
                          </span>
                          <span className="text-sm leading-snug text-black">{row.styleReasoning}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-700">
                            Functional
                          </span>
                          <span className="text-sm leading-snug text-black">{row.functionalReasoning}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="text-center text-xs text-black/40 pb-8">
        Prepared for export by the Studio Coordinator Agent. No slot editor — documentation view only.
      </footer>
    </main>
  );
}
