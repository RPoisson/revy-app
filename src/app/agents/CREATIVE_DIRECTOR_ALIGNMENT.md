# Creative Director context — alignment and flags

This file records what matches our existing loop/contract and what is **locked** for the CD build.

---

## Aligned (no change)

- **Loop**: Intake → Creative Director → PM → Studio Coordinator. One shot; CD outputs candidates + pairing rules only; PM selects one per slot.
- **CD output for PM**: `CreativeDirectorOutput`: `candidatesBySlot` (or `slots`) = ProductCandidate[] per slot; `pairingRules` = PairingRule[] (slotKeyA, slotKeyB, matchBy). Top 5–10 candidates per slot is the intended range; at least one required. **No MoodBoardSpec** — Studio Coordinator handles moodboards with current layouts; do not have the CD create a moodboard spec; do not change any current moodboard or Decision Details page files.
- **ProductCandidate** shape: id, vendor, vendor_sku, slotId, roomId?, title, material, finish, compatibility_key, metal_match_key, pairing_option, price, tier, fixtureType?, etc. — from DB.
- **Policy sources**: CD consults `styleDNA.ts` (STYLE_DNA) and `style_render_map.ts` (STYLE_RENDER_MAP) for archetype rules, slot rules, weights (3/2/1/-1/X), and disallows.
- **Ranking**: Weights 3 = Signature, 2 = Strong, 1 = Support, -1 = Avoid-lite, X = Disallow. CD uses these to rank/filter DB retrieval before outputting candidates.
- **Pairing**: FCH material/layout pairing rules (e.g. Carrara+Thassos with subway, terracotta with zellige/plaster) are enforced by the CD when building the candidate pool and when emitting `pairingRules` so the PM can enforce cross-slot compatibility.
- **36-inch rule**: Implemented in PM for **lighting in bathrooms only**; applies to **all archetypes**. Wall &lt; 36" → sconce excluded, prefer overhead. Ensure sconce + mirror pairings fit in 36" with **at least 1" margin on each side of the sconce**. Other slots are not considered.

---

## Locked decisions

### 1. 36-inch threshold for all archetypes

- **Decision**: Use **36"** as the single threshold for all archetypes (no Parisian-only override).
- **PM**: Already updated: `BATH_WALL_MIN_WIDTH_INCHES = 36`; narrow bathroom = wall &lt; 36".
- **Product/curation**: Ensure suitable **sconce and mirror pairings** that fit in a 36" space with at least 1" margin on each side of the sconce (documented in `SOURCELIST_IDS_AND_METADATA.md` and `RoomDimensions` in types).

### 2. MoodBoardSpec — not in CD output

- **Decision**: Ignore MoodBoardSpec for the CD handoff. CD output is **candidates + pairing only** (`CreativeDirectorOutput`). The **Studio Coordinator** handles the moodboard with the **current layouts already in the app**. Do not have the Creative Director create a moodboard spec. Do **not** change any current files for the moodboard page or the Decision Details section.

### 3. Axis names — keep codebase as-is

- **Decision**: Keep current codebase. Quiz/scoring use **modernRustic**, **minimalLayered**, **brightMoody** (0–1). Do not update the codebase to rename these axes. CD input uses these same names.

### 4. CD input shape (locked)

**Creative Director input** (explicit type to implement):

- **primaryArchetype** — from style/archetype quiz result (e.g. Parisian, Mediterranean, Provincial).
- **modernRustic**, **minimalLayered**, **brightMoody** — style axes 0–1 from quiz/scoring.
- **rooms** — list of rooms (and optionally room-level scope).
- **color_mood** — from the **last quiz question** (“What’s your ideal color mood?”): one of `mood_01` … `mood_05` (Bright & Airy, Soft Neutrals, Warm Earthy, Deep Muted, Cool & Calm). Stored in `answers["color_mood"]`; gated by `light_color` in the app.
- **Optional**: `exteriorStyle`, full `answers` for any extra quiz signals.

So the CD receives: **primaryArchetype** + **modernRustic**, **minimalLayered**, **brightMoody** + **rooms** + **color_mood** + optional exteriorStyle and full answers.

---

## Slot keys and room scope

- **Contract**: Slot key = `slotId` or `"slotId|roomId"` so the PM can do room-specific selection (e.g. tile_floor|kitchen vs tile_floor|primary_bath).
- Full-house strategies (e.g. octagon dot in main living; Carrara hex/penny in baths) and room-specific pairing: CD will output candidates per slot key (including room when needed) and pairing rules using the same keys.

---

## Summary

- **36" for all**; sconce+mirror fit in 36" with ≥1" margin each side. **No MoodBoardSpec**; CD = candidates + pairing only; Studio Coordinator keeps current moodboard/Decision Details. **Axis names** unchanged (modernRustic, minimalLayered, brightMoody). **CD input**: primaryArchetype + three axes + rooms + **color_mood** + optional exteriorStyle/answers.
- **Next**: Implement CD with this context; use styleDNA + style_render_map + FCH rules; output CreativeDirectorOutput only. Additive aesthetic direction can be informed by reference images (see below).

---

## Reference images for aesthetic direction

The Creative Director’s aesthetic rules can be extended using **reference images** (e.g. ~40 images you provide). I can interpret those images and suggest **additive aesthetic direction** the CD agent will use — e.g.:

- **Visual themes**: dominant materials, finishes, and forms (e.g. “honed stone, unlacquered brass, curved sconces”).
- **Pairing cues**: what tends to appear together (e.g. “zellige with plaster, marble with polished nickel”).
- **Do / avoid**: concrete “prefer X” or “avoid Y” rules that can be encoded in policy or slot rules.
- **Mood/palette**: how color mood (mood_01–mood_05) maps to materials and palettes in the images.

Output can be structured as a short **aesthetic brief** or **additive rule set** (text) that the CD implementation consumes (e.g. in prompts, or as structured policy alongside style_render_map). No changes to current moodboard or Decision Details files; this is input to the CD’s reasoning and candidate selection only.
