# Bathroom tub/shower config and names (quiz → CD & Studio Coordinator)

The scope quiz (1) **names each space** (all room types) when multiple are added, and (2) for each full bathroom asks: **1) Shower only  2) Combined shower and tub (alcove)  3) Separate shower and stand-alone tub.** This drives which products the Creative Director selects and which moodboard layout the Studio Coordinator uses.

---

## Quiz: name each space (all room types)

- **Step:** "Name each space" — shown after "Which spaces are you building or updating?" when at least one room is selected. Users can add multiple instances of any room type (via quantity); each instance must be named.
- **Answer key:** `room_names_<scopeRoomId>` (e.g. `room_names_kitchen`). Value is a **string[]**: one name per instance (e.g. `["Master Bath"]` for primary; `["Guest Bath", "Hall Bath"]` when the user selected 2 guest bathrooms).
- **Helpers:** `roomNamesKey(roomId)` and `ROOM_OPTION_LABELS` in `@/app/quiz/scope/questions`. For backward compatibility, `bathroomNamesKey(roomId)` returns `bathroom_names_<roomId>`. Use for display and for mapping moodboards to the user’s chosen labels.

---

## Quiz: tub/shower setup

- **Question:** Shown only when the user selected that bathroom in "Which spaces are you building or updating?" (e.g. primary bathroom, guest bathroom, secondary bathroom, kids bathroom). Powder room has no tub/shower config question.
- **Answer key:** `bathroom_config_<scopeRoomId>` (e.g. `bathroom_config_primary_bath`). Value is the first element of the selected option id: `shower_only` | `tub_and_shower_combined` | `tub_and_shower_separate`.
- **Scope question module:** `bathroomConfigKey(roomId)` and type `BathroomConfigId` in `@/app/quiz/scope/questions`.

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

Read config from answers: `const config = first(answers, bathroomConfigKey(scopeRoomId));` then `getMoodboardLayoutIdForBathroom(scopeRoomId, config)`.

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

- **Quiz:** One question per full bathroom (primary, guest, secondary, kids), options: Shower only | Combined shower and tub (alcove) | Separate shower and stand-alone tub. Stored in `answers[bathroomConfigKey(roomId)]`.
- **Studio Coordinator:** Use `getMoodboardLayoutIdForBathroom(scopeRoomId, config)` to choose the moodboard layout.
- **Creative Director:** Use config to decide which tub-related slots to fill (shower floor/wall always; alcove tub vs freestanding tub per config).
