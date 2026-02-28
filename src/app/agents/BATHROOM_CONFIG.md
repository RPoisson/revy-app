# Bathroom tub/shower config and names (quiz → CD & Studio Coordinator)

The scope quiz (1) **names each space** (all room types) when multiple are added, and (2) for each full bathroom asks: **1) Shower only  2) Combined shower and tub (alcove)  3) Separate shower and stand-alone tub.** This drives which products the Creative Director selects and which moodboard layout the Studio Coordinator uses.

---

## Quiz: name each space (all room types)

- **Step:** "Name each space" — shown after "Which spaces are you building or updating?" when at least one room is selected. Users can add multiple instances of any room type (via quantity); each instance must be named.
- **Answer key:** `room_names_<scopeRoomId>` (e.g. `room_names_kitchen`). Value is a **string[]**: one name per instance (e.g. `["Master Bath"]` for primary; `["Guest Bath", "Hall Bath"]` when the user selected 2 guest bathrooms).
- **Helpers:** `roomNamesKey(roomId)` and `ROOM_OPTION_LABELS` in `@/app/quiz/scope/questions`. For backward compatibility, `bathroomNamesKey(roomId)` returns `bathroom_names_<roomId>`. Use for display and for mapping moodboards to the user’s chosen labels.

---

## Quiz: tub/shower setup

- **Question:** One page, "What's the setup in each bathroom?" — shown when at least one full bathroom is selected (primary, guest, secondary, kids). Powder has no tub/shower config. For each bathroom instance (e.g. Guest bathroom (1), Guest bathroom (2)), the user picks one of three options.
- **Answer key:** `bathroom_config_<scopeRoomId>` (e.g. `bathroom_config_guest_bath`). Value is a **string[]**: one config per instance, in order. Each element is `shower_only` | `tub_and_shower_combined` | `tub_and_shower_separate`. Example: 2 guest bathrooms → `["tub_and_shower_combined", "shower_only"]`.
- **Scope question module:** `bathroomConfigKey(roomId)`, `BATHROOM_CONFIG_OPTIONS`, `BATHROOM_CONFIG_ROOM_IDS`, type `BathroomConfigId` in `@/app/quiz/scope/questions`.

---

## Studio Coordinator: which layout to use

Use **`getMoodboardLayoutIdForBathroom(scopeRoomId, config)`** from `@/app/agents/rooms` (or `agents/index`):

| Scope room | Config | Moodboard layout ID |
|------------|--------|----------------------|
| primary_bath | shower_only | primary-bathroom-no-tub |
| primary_bath | tub_and_shower_combined \| tub_and_shower_separate | primary-bathroom |
| guest_bath, secondary_bath, kids_bath | tub_and_shower_combined | guest-kids-bath-tub-shower |
| guest_bath, secondary_bath, kids_bath | shower_only \| tub_and_shower_separate | guest-kids-bath |
| powder | (no config) | powder-room |

Read config per instance: `const configs = answers[bathroomConfigKey(scopeRoomId)] ?? [];` then for instance index `i`: `getMoodboardLayoutIdForBathroom(scopeRoomId, configs[i])`.

---

## Creative Director: which slots to fill

Use the same config so the CD only requests/returns candidates for the slots that exist in that bathroom:

| Config | Slots to include |
|--------|-------------------|
| **shower_only** | Shower floor tile, shower wall tile, shower fixtures. No tub (no alcove tub, no freestanding tub). |
| **tub_and_shower_combined** | Shower floor, shower wall, shower fixtures; **alcove tub** (combined tub/shower). |
| **tub_and_shower_separate** | Shower floor, shower wall, shower fixtures; **stand-alone tub** (freestanding tub). |

So the CD (or the slot list that the CD uses per room) should be derived from the bathroom config: e.g. include `freestanding_tub` only when config is `tub_and_shower_separate`; include `alcove_tub` or equivalent only when config is `tub_and_shower_combined`; for `shower_only`, omit tub slots.

---

## Summary

- **Quiz:** One page listing every bathroom instance; each instance gets one of: Shower only | Combined shower and tub (alcove) | Separate shower and stand-alone tub. Stored in `answers[bathroomConfigKey(roomId)]` as **string[]** (one element per instance).
- **Studio Coordinator:** Use `getMoodboardLayoutIdForBathroom(scopeRoomId, config)` to choose the moodboard layout.
- **Creative Director:** Use config to decide which tub-related slots to fill (shower floor/wall always; alcove tub vs freestanding tub per config).
