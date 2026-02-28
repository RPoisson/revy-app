# Quiz images → Creative Director aesthetic reference

This document maps the **quiz image folders** (q1–q8) to **additive aesthetic direction** for the Creative Director agent. Use it to train CD logic: which materials, finishes, pairings, and moods to prefer or avoid given user selections. **Do not change** any moodboard or Decision Details UI; this is input to CD reasoning and candidate selection only.

---

## 1. Image inventory (by question)

| Folder | Question ID | Options / image IDs | Purpose for CD |
|--------|-------------|---------------------|----------------|
| **q1** | `spaces_appeal` | `space_01` … `space_27` | Room/space types user is drawn to; informs slot scoping and which rooms get which material strategy. |
| **q2** | (archetype) | `home_01`, `home_02`, `home_03` | **Primary archetype vibe**: Refined & Elegant (Parisian), Cozy & Lived-in (Provincial), Sun-kissed & Relaxed (Mediterranean). |
| **q3** | `light_color` | `light_01`, `light_02`, `light_03` | **brightMoody** proxy: Bright & Airy, Balanced with Contrast, Moody & Dramatic. Gates `color_mood` options. |
| **q5** | `material_palette` | `material_01`, `material_02`, `material_03` | **Material direction**: Smooth & Polished, Mixed Textures, Raw & Organic. |
| **q6** | `space_feel` | `feel_01`, `feel_02`, `feel_03` | **Space feel**: Clean & Streamlined, Balanced & Comfortable, Layered & Collected. |
| **q8** | `color_mood` | `mood_01` … `mood_05` | **Color mood** (last quiz question): palette and accent direction. |

**Note:** q4 is not referenced in `questions.ts` for quiz images; q7 contains texture assets (`texture_02`, `texture_03`, etc.) that may be used elsewhere. Exterior styles live under `/quiz/exterior/`.

---

## 2. Archetype visuals (q2: home_01, home_02, home_03)

| Option | Label | Aesthetic direction for CD |
|--------|--------|----------------------------|
| **home_01** | Refined & Elegant (Parisian) | Boiserie, gold-framed mirrors, light marble/quartz tabletops, dark wood consoles, matte black accents. **Materials:** honed stone, lacquered or antique brass, painted millwork. **Avoid:** raw or heavily rustic materials in primary slots. **Pairing:** mirror + console proportion; gold + dark wood + light stone. |
| **home_02** | Cozy & Lived-in (Provincial) | Plaster/limewash walls, terracotta tile, dark stained wood (mirror, console, bentwood chair), unglazed ceramics, linen textiles, olive plant. **Materials:** terracotta, natural wood, unglazed ceramic, linen. **Finishes:** matte, low-sheen. **Pairing:** wood tone match across mirror/table/chair; terracotta + plaster. (If `project_for === 'investment_rental'`, PM will swap plaster→paint, unlacquered→lacquered; CD can still propose the look.) |
| **home_03** | Sun-kissed & Relaxed (Mediterranean) | Terracotta floor, arched window, cream sofa, large plant in earthenware pot, warm creams/beiges. **Materials:** terracotta, natural fabrics, warm painted walls, natural wood. **brightMoody** high (bright). Pairing: terracotta + cream + greenery; soft curves (arch, rounded pot). |

---

## 3. Light & color balance (q3: light_01, light_02, light_03)

| Option | Label | Aesthetic direction for CD |
|--------|--------|----------------------------|
| **light_01** | Bright & Airy | Cream/off-white monochrome, sheer curtains, herringbone wood, brass window hardware. Prefer light finishes, diffused light, warm neutrals. **brightMoody** → bright. |
| **light_02** | Balanced with Contrast | Deep built-in (e.g. forest green/charcoal/navy), tan leather, light walls, classic millwork. Prefer bold architectural color + warm leather + light walls; layered but not maximal. **brightMoody** → mid. |
| **light_03** | Moody & Dramatic | Deep olive/sage walls, candlelight, aged brass, warm tan upholstery, arched niche. Prefer matte paint, warm metals (brass/bronze), ambient lighting. **brightMoody** → moody. Unlacquered/raw metals fit; for rental, PM will swap to lacquered. |

---

## 4. Material palette (q5: material_01, material_02, material_03)

| Option | Label | Aesthetic direction for CD |
|--------|--------|----------------------------|
| **material_01** | Smooth & Polished | White marble + dark stone + brushed brass; high contrast, refined. Prefer natural stone, honed/polished, warm metals. **Pairing:** light stone + dark stone + brass (e.g. `metal_match_key`, compatibility_key for stone families). |
| **material_02** | Mixed Textures | Light wood, linen, smooth stone, foliage; serene, tactile. Prefer light oak, linen/cotton, matte stone, soft greens. **modernRustic** moderate; **minimalLayered** high (texture over pattern). |
| **material_03** | Raw & Organic | Unglazed ceramic, raw wood slab, terracotta vase; irregular edges, matte. Prefer ceramic/terracotta, natural wood, matte/raw finishes. **modernRustic** high (rustic); avoid high-gloss. |

---

## 5. Space feel (q6: feel_01, feel_02, feel_03)

| Option | Label | Aesthetic direction for CD |
|--------|--------|----------------------------|
| **feel_01** | Clean & Streamlined | Monochrome cream/yellow, reeded wood nightstands, spherical pendants, upholstered headboard. Prefer simple forms, soft curves, minimal ornament; symmetry. |
| **feel_02** | Balanced & Comfortable | Warm beige bedding, channel-tufted headboard, brass fluted-glass sconces, dark wood nightstands. **Sconces:** compact, side-mounted; ensure sconce+mirror pairings fit 36" with ≥1" margin when used in bathrooms. **metal_match_key** for brass. |
| **feel_03** | Layered & Collected | Cloud wallpaper, layered bedding, sage accent, brass ribbed sconces, dark wood. Prefer pattern + texture layering in a cohesive palette; classic/transitional. |

---

## 6. Color mood (q8: mood_01 … mood_05)

| Option | Label | Aesthetic direction for CD |
|--------|--------|----------------------------|
| **mood_01** | Soft Neutrals & Warm Whites | Creams, beiges, light wood, cotton/botanicals; serene, minimal. Prefer light oak, linen, matte finishes; avoid deep contrast or saturated color. |
| **mood_02** | High Contrast Neutrals (Cream, Charcoal, Navy) | Muted neutrals + deep accents (charcoal, navy, dark wood). Parisian/European. Prefer dark wood, matte paint, white/cream; classic metal finishes. |
| **mood_03** | Jewel Tones (Green, Teal, Burgundy, Navy) | Deep teal, navy, golden yellow, burgundy; botanical patterns, peacock, roses. Prefer rich saturated tones, botanical motifs; classic/refined. **brightMoody** → moody. |
| **mood_04** | Deep Muted (Plum, Charcoal, Green, Brown) | Forest green, burgundy, pomegranate, aged brass, dark wood, botanical. Very moody; prefer dark greens, deep reds, matte velvets, aged metals. |
| **mood_05** | Nature-inspired (Cream, Blue, Green) | Mediterranean: blues, greens, white, fuchsia bougainvillea, terracotta. Bright; prefer white/plaster, blue shutters, terracotta, natural greens. |

---

## 7. Spaces (q1: space_01 … space_27)

- **Use:** Which **rooms** and **space types** the user selected (e.g. kitchen, primary bath, dining, bedroom). Drives **slot scoping** and **room-level** strategies (e.g. octagon dot in living, Carrara hex in baths).
- **Example (space_01):** Dining with stucco fireplace, beams, stone floor, wood table, cane chairs, terracotta vase → **modernRustic** high, terracotta + plaster + wood pairings.
- **Example (space_08):** Kitchen with terracotta floor, plaster hood, woven pendant, open shelving, pottery → terracotta + plaster + natural wood; **36-inch rule** N/A (kitchen; no bathroom sconce).

---

## 8. Additive rules to encode in CD logic

- **primaryArchetype (from q2):** Parisian → refined materials, gold/antique brass, boiserie-friendly; Provincial → terracotta, plaster, dark wood, bentwood; Mediterranean → terracotta, arches, cream, greenery.
- **modernRustic, minimalLayered, brightMoody (from quiz scoring + q3, q5, q6):** Use axes to rank/filter candidates (e.g. high rustic → prefer raw/organic materials; high minimal → prefer clean lines and limited pattern).
- **color_mood (from q8):** Map mood_01–mood_05 to preferred palettes and accent colors; avoid materials/colors that clash (e.g. mood_01 vs bold jewel tones).
- **Pairing:** Enforce **metal_match_key** for faucet/hardware/sconces; **compatibility_key** for tile/grout and stone families; **pairing_option** where product metadata defines pairs. For **bathroom lighting**, only propose sconce+mirror combinations that fit in **36"** with **≥1" margin** each side of sconce.
- **Finishes:** material_01 → honed/polished; material_02 → matte, textured; material_03 → matte, raw. Respect **project_for** (rental/flip) in candidate set; PM will apply swap rules.

---

## 9. How to use this in the CD implementation

1. **Input:** `CreativeDirectorInput` includes `primaryArchetype`, `modernRustic`, `minimalLayered`, `brightMoody`, `rooms`, `color_mood`, and optional `answers`/`exteriorStyle`.
2. **Policy:** Combine this reference with `styleDNA.ts` and `style_render_map.ts` (weights 3/2/1/-1/X, slot rules, disallows). Use quiz-derived inputs to **bias** which product queries and filters to run (e.g. by material, finish, color family).
3. **Output:** CD returns **CreativeDirectorOutput** only (candidatesBySlot + pairingRules). No MoodBoardSpec; Studio Coordinator uses existing layouts.
4. **36" rule:** Product data and curation should offer sconce + mirror options that fit 36" with margins; CD chooses among them for bathroom lighting slots; PM applies the 36" rule when dimensions are provided.

This file is the **single reference** for quiz-image-derived aesthetic direction for the Creative Director agent.
