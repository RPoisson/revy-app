"use client";

import { useMemo, useState } from "react";
import {
  buildPlaceholderDesignConcept,
} from "../designConceptData";
import type { ArchetypeId } from "@/app/style/styleDNA";
import { ALL_ROOMS, getRoomLayout } from "../roomLayouts";
import { RoomSelector } from "../RoomSelector";
import { MoodboardCanvasView } from "../MoodboardCanvasView";
import { SectionHeader } from "../components/SectionHeader";

const PLACEHOLDER_ARCHETYPE: ArchetypeId = "provincial";
const PLACEHOLDER_INVESTMENT_LABEL = "$200k–$350k";

export default function MoodboardLayoutsPage() {
  const [selectedRoomId, setSelectedRoomId] = useState(ALL_ROOMS[0].id);

  const data = useMemo(
    () => buildPlaceholderDesignConcept(PLACEHOLDER_ARCHETYPE, PLACEHOLDER_INVESTMENT_LABEL),
    []
  );
  const { moodboard } = data;

  const layout = getRoomLayout(selectedRoomId);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">
      <SectionHeader
        number="02"
        title="Design Concept Moodboard"
        subtitle="Visual material boards for each room in scope. Select a room to view its layout."
      />
      <div className="w-full max-w-[1000px] mx-auto mb-6">
        <RoomSelector
          rooms={ALL_ROOMS}
          selectedRoomId={selectedRoomId}
          onSelect={setSelectedRoomId}
        />
      </div>
      <div className="max-w-[1000px] mx-auto">
        {layout && (
          <MoodboardCanvasView
            layout={layout}
            paletteColors={moodboard.paletteStripColors}
            conceptLabel={layout.displayName ?? layout.name}
          />
        )}
      </div>
    </section>
  );
}
