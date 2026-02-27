"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  buildPlaceholderDesignConcept,
} from "../designConceptData";
import type { ArchetypeId } from "@/app/style/styleDNA";
import { ALL_ROOMS, getRoomLayout } from "../roomLayouts";
import { RoomSelector } from "../RoomSelector";
import { SectionHeader, CARD_STYLE } from "../components/SectionHeader";

const PLACEHOLDER_ARCHETYPE: ArchetypeId = "provincial";
const PLACEHOLDER_INVESTMENT_LABEL = "$200k–$350k";

export default function DecisionDetailPage() {
  const [selectedRoomId, setSelectedRoomId] = useState(ALL_ROOMS[0].id);

  const data = useMemo(
    () => buildPlaceholderDesignConcept(PLACEHOLDER_ARCHETYPE, PLACEHOLDER_INVESTMENT_LABEL),
    []
  );
  const { materials } = data;
  const layout = getRoomLayout(selectedRoomId);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">
      <SectionHeader
        number="03"
        title="Decision Detail"
        subtitle="Selection reasoning — Style and Scope logic for every material choice."
      />
      <div className="w-full max-w-[1000px] mx-auto mb-6">
        <RoomSelector
          rooms={ALL_ROOMS}
          selectedRoomId={selectedRoomId}
          onSelect={setSelectedRoomId}
        />
      </div>
      <div
        className="w-full max-w-[1000px] mx-auto overflow-hidden"
        style={CARD_STYLE}
      >
        <div className="px-6 sm:px-8 py-5 border-b border-black/10">
          <h4 className="font-[var(--font-playfair)] text-lg font-semibold text-black">
            {layout?.displayName ?? layout?.name ?? "Material slots"}
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
                      <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-amber-100/80 text-amber-900 w-[4.5rem] text-center">
                          Style
                        </span>
                        <span className="text-sm leading-snug text-black">{row.styleReasoning}</span>
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-700 w-[4.5rem] text-center">
                          Scope
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
  );
}
