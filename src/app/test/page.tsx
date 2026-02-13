// src/app/test/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import { LAYOUT_V1, withComputedRects } from "../../lib/moodboard/layoutSpec";
import type { SlotId } from "../../lib/moodboard/layoutSpec";

const BASE = "/moodboard_refs/v1";
const path = (folder: string, file: string) => `${BASE}/${folder}/${file}`;

// Friendly labels (shown above each image)
const LABELS: Partial<Record<SlotId, string>> = {
  wood_floor: "Walnut Herringbone Floor",
  stone_1: "Calacatta Lux Granite",
  stone_2: "Carrara Marble",
  textile_1: "Velvet",
  textile_2: "Leather",
  wood_accent: "Walnut Accent",
  metal: "Unlacquered Brass",
  paint_1: "Wevet",
  paint_2: "Ammonite",
  paint_3: "Railings",
  paint_4: "Down Pipe",
  tile_1: "Marble Basketweave",
  tile_2: "Marble Basketweave",
  tile_3: "Contrasting Grout Marble Stack",
  tile_4: "Zellige Mosaic",
};

export default function Page() {
  const layout = React.useMemo(() => withComputedRects(LAYOUT_V1), []);

  // Hardcoded slot -> image mapping (your current test set)
  const slots: Partial<Record<SlotId, string>> = React.useMemo(
    () => ({
      wood_floor: path("wood_flooring", "wood_flooring_dark_walnut_herringbone_01.jpg"),
      stone_1: path("stone_slab", "stone_calacatta_lux_quartzite_01.jpg"),
      stone_2: path("stone_slab", "stone_carrara_01.jpg"),
      textile_1: path("textile", "textile_velvet_01.jpg"),
      textile_2: path("textile", "textile_dark_leather_01.jpg"),
      wood_accent: path("accent_wood", "accent_wood_walnut_01.jpg"),
      metal: path("metal", "metal_brass_unlacquered_01.jpg"),
      paint_1: path("paint", "paint_wevet.jpg"),
      paint_2: path("paint", "paint_ammonite.jpg"),
      paint_3: path("paint", "paint_railings.jpg"),
      paint_4: path("paint", "paint_down_pipe.jpg"),
      tile_1: path("flooring", "flooring_marble_basketweave_01.jpg"),
      tile_2: path("flooring", "flooring_marble_basketweave_01.jpg"),
      tile_3: path("wall_tile", "wall_tile_contrasting_grout_marble_stack_01.jpg"),
      tile_4: path("wall_tile", "wall_tile_zellige_mosaic_01.jpg"),
    }),
    []
  );

  const slotList = React.useMemo(() => {
    return Object.values(layout.slots).slice().sort((a, b) => a.z - b.z);
  }, [layout]);

  // Page/container styling to match “design brief” vibe: white card, border, subtle shadow
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background: "#f3f4f6", // light neutral page backdrop
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.2 }}>
            Moodboard Layout Test
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Hardcoded assets • LayoutSpec-driven positioning
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(17,17,17,0.10)",
            borderRadius: 18,
            boxShadow: "0 10px 24px rgba(17,17,17,0.06)",
            padding: 18,
          }}
        >
          {/* Make the board itself large on screen */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: String(layout.aspectRatio),
              background: layout.background,
              overflow: "hidden",
              borderRadius: 14,
            }}
          >
            {/* Paint strip background */}
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

            {slotList.map((slot) => {
              const src = slots[slot.id];
              const label = LABELS[slot.id] ?? slot.id;

              const style: React.CSSProperties = {
                position: "absolute",
                left: `${slot.rect.x * 100}%`,
                top: `${slot.rect.y * 100}%`,
                width: `${slot.rect.w * 100}%`,
                height: `${slot.rect.h * 100}%`,
              };

              // Label sits just above the image area (still inside the slot box)
              // The label background is translucent white to stay readable on photos.
              return (
                <div key={slot.id} style={style}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      transform: "translateY(-110%)",
                      display: "flex",
                      justifyContent: "flex-start",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.2,
                        padding: "4px 8px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(17,17,17,0.10)",
                        boxShadow: "0 6px 14px rgba(17,17,17,0.06)",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={label}
                    >
                      {label}
                    </div>
                  </div>

                  {/* Image area */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 10,
                      overflow: "hidden",
                      background: "rgba(17,17,17,0.04)",
                      border: "1px solid rgba(17,17,17,0.08)",
                    }}
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt={label}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 1400px"
                        onError={() => {
                          // eslint-disable-next-line no-console
                          console.error(`[moodboard:test] failed to load ${slot.id}: ${src}`);
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
            Asset base path: <code>{BASE}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
