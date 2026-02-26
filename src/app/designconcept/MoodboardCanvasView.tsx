"use client";

import { useMemo } from "react";
import type { RoomLayoutSpec, SlotLayout } from "./roomLayouts";
import { withComputedRects } from "./roomLayouts";

const SLOT_PLACEHOLDER = "rgba(120, 120, 120, 0.06)";
const SLOT_BORDER = "rgba(120, 120, 120, 0.20)";

interface MoodboardCanvasViewProps {
  layout: RoomLayoutSpec;
  paletteColors: string[];
  /** e.g. "Kitchen" or "Provincial — Countryside warmth" */
  conceptLabel: string;
}

export function MoodboardCanvasView({
  layout,
  paletteColors,
  conceptLabel,
}: MoodboardCanvasViewProps) {
  const computed = useMemo(() => withComputedRects(layout), [layout]);
  const slotList = useMemo(
    () =>
      Object.values(computed.slots)
        .filter((s) => s.id !== "logo_1" && s.id !== "logo_2")
        .sort((a, b) => a.z - b.z),
    [computed]
  );

  return (
    <div
      className="w-full max-w-[1000px]"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(17,17,17,0.10)",
        borderRadius: 18,
        boxShadow: "0 10px 24px rgba(17,17,17,0.06)",
        padding: 18,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: String(computed.aspectRatio),
          background: computed.background,
          overflow: "visible",
          borderRadius: 14,
        }}
      >
        {/* Palette strip background (exact Lovable position) */}
        <div
          style={{
            position: "absolute",
            left: `${computed.paletteStrip.rect.x * 100}%`,
            top: `${computed.paletteStrip.rect.y * 100}%`,
            width: `${computed.paletteStrip.rect.w * 100}%`,
            height: `${computed.paletteStrip.rect.h * 100}%`,
            background: computed.paletteStrip.background,
            outline: `1px solid ${computed.paletteStrip.outline}`,
            borderRadius: 8,
            boxSizing: "border-box",
          }}
        />

        {/* Slots: material slots as placeholders; palette slots as color chips */}
        {slotList.map((slot) => {
          const isPalette = slot.isPalette ?? slot.id.startsWith("palette_");
          const paletteIndex = isPalette
            ? parseInt(slot.id.replace("palette_", ""), 10) - 1
            : -1;
          const fillColor =
            isPalette && paletteColors[paletteIndex] != null
              ? paletteColors[paletteIndex]
              : SLOT_PLACEHOLDER;

          return (
            <div
              key={slot.id}
              style={{
                position: "absolute",
                left: `${slot.rect.x * 100}%`,
                top: `${slot.rect.y * 100}%`,
                width: `${slot.rect.w * 100}%`,
                height: `${slot.rect.h * 100}%`,
                zIndex: slot.z,
                background: fillColor,
                border: isPalette ? "none" : `1.5px solid ${SLOT_BORDER}`,
                borderRadius: isPalette ? 4 : 10,
                boxSizing: "border-box",
              }}
            />
          );
        })}

        {/* Room concept label (Lovable: bottom left inside canvas) */}
        <div
          style={{
            position: "absolute",
            bottom: "2%",
            left: "3.7%",
            right: "15%",
            pointerEvents: "none",
          }}
        >
          <span
            className="font-[var(--font-playfair)] text-sm tracking-[0.2em] uppercase text-black/50"
          >
            {conceptLabel} Concept
          </span>
          <div style={{ marginTop: 4, height: 1, background: "rgba(120,120,120,0.35)", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
