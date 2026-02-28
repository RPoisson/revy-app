"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import {
  buildPlaceholderDesignConcept,
  type DesignConceptDetail,
} from "./designConceptData";
import type { ArchetypeId } from "@/app/style/styleDNA";
import { ALL_ROOMS, getRoomLayout } from "./roomLayouts";
import { RoomSelector } from "./RoomSelector";
import { MoodboardCanvasView } from "./MoodboardCanvasView";
import { SectionHeader, CARD_STYLE } from "./components/SectionHeader";
import { useProjects } from "@/context/ProjectContext";
import { getDesignsCreated } from "@/lib/designsCreatedStore";
import { getAnswers } from "@/app/quiz/lib/answersStore";
import { buildMoodboardRoomsFromScope, type MoodboardRoomItem } from "./buildMoodboardRooms";

const PLACEHOLDER_ARCHETYPE: ArchetypeId = "provincial";
const PLACEHOLDER_INVESTMENT_LABEL = "$200k–$350k";

/** Rooms to show in selector: from scope (custom/default names) or fallback to ALL_ROOMS. */
function useMoodboardRoomsList(designsCreated: boolean, projectId: string | undefined) {
  return useMemo(() => {
    if (!designsCreated) return ALL_ROOMS;
    const answers = getAnswers(projectId);
    const scopeRooms = buildMoodboardRoomsFromScope(answers);
    if (scopeRooms.length > 0) return scopeRooms;
    return ALL_ROOMS;
  }, [designsCreated, projectId]);
}

export default function DesignConceptPage() {
  const { currentProjectId } = useProjects();
  const designsCreated = getDesignsCreated(currentProjectId);
  const roomsList = useMoodboardRoomsList(designsCreated, currentProjectId ?? undefined);

  const firstId = useMemo(
    () => (Array.isArray(roomsList) && roomsList.length > 0 ? (roomsList[0] as { id: string }).id : ALL_ROOMS[0].id),
    [roomsList]
  );
  const [selectedRoomId, setSelectedRoomId] = useState(firstId);

  useEffect(() => {
    const ids = new Set(roomsList.map((r) => (r as { id: string }).id));
    if (!ids.has(selectedRoomId)) setSelectedRoomId(firstId);
  }, [roomsList, selectedRoomId, firstId]);

  const data: DesignConceptDetail = useMemo(
    () => buildPlaceholderDesignConcept(PLACEHOLDER_ARCHETYPE, PLACEHOLDER_INVESTMENT_LABEL),
    []
  );

  const { executiveSummary, moodboard, materials } = data;

  const selectedItem = useMemo(
    () => roomsList.find((r) => (r as { id: string }).id === selectedRoomId),
    [roomsList, selectedRoomId]
  );
  const layout = useMemo(() => {
    const layoutId = (selectedItem as MoodboardRoomItem)?.layoutId ?? (selectedItem as { id: string })?.id ?? selectedRoomId;
    return getRoomLayout(layoutId);
  }, [selectedItem, selectedRoomId]);
  const conceptLabel = useMemo(() => {
    if (selectedItem && "displayName" in selectedItem && selectedItem.displayName)
      return selectedItem.displayName;
    if (selectedItem && "name" in selectedItem) return (selectedItem as { displayName?: string; name?: string }).displayName ?? (selectedItem as { name: string }).name;
    return layout?.displayName ?? layout?.name ?? "Room";
  }, [selectedItem, layout]);

  return (
    <div className="min-h-screen bg-[var(--background)]" data-design-concept-detail>
      {!designsCreated && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:pl-8 pt-6 pb-12">
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
            <p className="font-medium">No designs created yet</p>
            <p className="mt-1 text-amber-800/90">
              You have a project plan but haven&apos;t generated designs. Go to your{" "}
              <Link href="/brief" className="underline font-medium hover:no-underline">
                Project Plan
              </Link>{" "}
              and click <strong>Create Designs</strong> to generate them.
            </p>
          </div>
        </div>
      )}

      {designsCreated && (
        <>
          {/* 01 Summary */}
          <section
            id="executive-summary"
            className="scroll-mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:pl-8 pt-12 pb-16"
          >
            <SectionHeader
              number="01"
              title="Summary"
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

          {/* 02 Moodboards */}
          <section
            id="moodboards"
            className="scroll-mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:pl-8 pt-12 pb-16"
          >
            <SectionHeader
              number="02"
              title="Moodboards"
              subtitle="Visual material boards for each room in scope. Select a room to view its layout."
            />
            <div className="w-full max-w-[1000px] mx-auto mb-6">
              <RoomSelector
                rooms={roomsList}
                selectedRoomId={selectedRoomId}
                onSelect={setSelectedRoomId}
              />
            </div>
            <div className="max-w-[1000px] mx-auto">
              {layout ? (
                <MoodboardCanvasView
                  layout={layout}
                  paletteColors={moodboard.paletteStripColors}
                  conceptLabel={conceptLabel}
                />
              ) : null}
            </div>
          </section>

          {/* 03 Decision Detail */}
          <section
            id="decision-detail"
            className="scroll-mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:pl-8 pt-12 pb-16"
          >
            <SectionHeader
              number="03"
              title="Decision Detail"
              subtitle="Selection reasoning — Style and Scope logic for every material choice."
            />
            <div className="w-full max-w-[1000px] mx-auto mb-6">
              <RoomSelector
                rooms={roomsList}
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
                  {getRoomLayout(selectedRoomId)?.displayName ?? getRoomLayout(selectedRoomId)?.name ?? "Material slots"}
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
        </>
      )}
    </div>
  );
}
