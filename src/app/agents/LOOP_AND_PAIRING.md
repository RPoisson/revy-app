# Creative Director ↔ Project Manager loop and pairing

## Loop order

1. **Creative Director** receives user input (quiz answers, style, room scope) and:
   - Queries the product database (e.g. by archetype, slot, style).
   - Returns **multiple candidates per slot** (`ProductCandidate[]` per slot).
   - Sends **pairing rules** that describe which slots must be compatible (e.g. tile + grout, hardware + faucet).

2. **Project Manager** receives that output and:
   - Derives a **selection order** from pairing rules: for each rule “slotKeyB must match slotKeyA,” the PM selects **slotKeyA first**, then **slotKeyB** (so slotKeyB can be filtered by the chosen product for slotKeyA).
   - For each slot, in that order:
     - Applies **finish/scope rules** (rental, flip, finish tier; 40-inch rule only for lighting in bathrooms).
     - Applies **pairing**: if this slot is a `slotKeyB`, keeps only candidates compatible with the already-selected product for `slotKeyA`.
     - Ranks by **budget** and picks one.
   - Returns **exactly one product per slot**, with no nulls. Selections respect pairing so products across slots are compatible.

3. **Studio Coordinator** consumes the PM’s selected products and scope reasoning for the Decision Details table and sourcelist.

So the loop is **one shot**: Creative Director sends candidates + pairing rules once; PM selects one per slot in dependency order and returns the final selection. There is no multi-round negotiation; pairing is enforced in a single pass by ordering and filtering.

---

## Pairing rules (Creative Director → PM)

The Creative Director sends `pairingRules` in `CreativeDirectorOutput`:

```ts
pairingRules: [
  { slotKeyA: "tile_floor", slotKeyB: "grout", matchBy: "compatibility_key" },
  { slotKeyA: "faucet",    slotKeyB: "hardware", matchBy: "metal_match_key" },
]
```

- **slotKeyA**: Slot chosen first (anchor). Use the same key as in `candidatesBySlot` or `slots` (e.g. `"tile_floor"` or `"tile_floor|primary_bath"`).
- **slotKeyB**: Slot chosen second; its candidates are filtered to those compatible with the selection for slotKeyA.
- **matchBy**: How compatibility is checked:
  - **compatibility_key**: Product rows have `compatibility_key`; the selected product for slotKeyA and the candidate for slotKeyB must have the same value (e.g. same grout family).
  - **metal_match_key**: Same idea for metals (e.g. faucet and hardware share `metal_match_key`).
  - **pairing_option**: Product has `pairing_option` (string or string[]) that lists product IDs or labels it pairs with; PM checks that slotKeyB’s candidate pairs with slotKeyA’s selected product (or vice versa).

Selection order is built from these rules: any slot that appears only as slotKeyA (or in no rule) is selected first; then slotKeyB slots after their slotKeyA. If slot C depends on B and B depends on A, order is A → B → C.

---

## Product fields used for pairing

On **ProductCandidate** (from your DB), the PM uses:

- **compatibility_key**: Optional; for `matchBy: "compatibility_key"`.
- **metal_match_key**: Optional; for `matchBy: "metal_match_key"`.
- **pairing_option**: Optional string or string[]; for `matchBy: "pairing_option"` (e.g. "Zellige subway, plaster, ceramic subway" or list of product IDs).

The Creative Director should populate these from `master_products` (or your CSV) when building candidates so the PM can filter by compatibility.
