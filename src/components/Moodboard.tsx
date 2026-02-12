// src/components/moodboard/Moodboard.tsx
import React from "react";
import Image from "next/image";
import type { MoodboardLayoutSpec, SlotLayout } from "@/lib/moodboard/layoutSpec.v1";
import type { SlotId } from "@/lib/moodboard/layoutSpec.v1";

export type SlotContent =
  | { kind: "image"; src: string }
  | { kind: "color"; hex: string; label?: string };

type MoodboardProps = {
  layout: MoodboardLayoutSpec;
  slots: Partial<Record<SlotId, SlotContent>>;
  /** Optional: show slot ids overlaid for debugging layout */
  debugLabels?: boolean;
};

export function Moodboard({ layout, slots, debugLabels = false }: MoodboardProps) {
  const slotList: SlotLayout[] = Object.values(layout.slots);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: String(layout.aspectRatio),
        background: layout.background,
        overflow: "hidden",
      }}
    >
      {/* Paint palette strip background */}
      <div
        style={{
          position: "absolute",
          left: `${layout.paintStrip.rect.x * 100}%`,
          top: `${layout.paintStrip.rect.y * 100}%`,
          width: `${layout.paintStrip.rect.w * 100}%`,
          height: `${layout.paintStrip.rect.h * 100}%`,
          background: layout.paintStrip.background,
          outline: `1px solid ${layout.paintStrip.outline}`,
          boxSizing: "border-box",
        }}
      />

      {slotList
        .slice()
        .sort((a, b) => a.z - b.z)
        .map((slot) => {
          const content = slots[slot.id];

          const style: React.CSSProperties = {
            position: "absolute",
            left: `${slot.rect.x * 100}%`,
            top: `${slot.rect.y * 100}%`,
            width: `${slot.rect.w * 100}%`,
            height: `${slot.rect.h * 100}%`,
          };

          // Placeholder if no content
          if (!content) {
            return (
              <div
                key={slot.id}
                style={{
                  ...style,
                  background: "rgba(17,17,17,0.05)",
                }}
              />
            );
          }

          if (content.kind === "color") {
            return (
              <div key={slot.id} style={{ ...style, background: content.hex }}>
                {debugLabels ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 6,
                      top: 6,
                      fontSize: 11,
                      padding: "2px 6px",
                      background: "rgba(255,255,255,0.75)",
                      borderRadius: 6,
                    }}
                  >
                    {slot.id}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <div key={slot.id} style={style}>
              <Image
                src={content.src}
                alt={slot.id}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              {debugLabels ? (
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    top: 6,
                    fontSize: 11,
                    padding: "2px 6px",
                    background: "rgba(255,255,255,0.75)",
                    borderRadius: 6,
                  }}
                >
                  {slot.id}
                </div>
              ) : null}
            </div>
          );
        })}
    </div>
  );
}
