# Sourcelist IDs, Metadata & RoomDimensions

## Creative Director ↔ PM loop (no “linking” step)

The **Creative Director** returns **real products from the DB** (multiple per slot). The **PM** selects **exactly one product per slot** from those candidates (finish/scope rules first, then budget). The PM output is the chosen products themselves — there is no separate “resolve material ID to product” step. The Studio Coordinator uses the selected product’s `vendor`, `vendor_sku`, and `scopeReasoning` directly. See `MASTER_PRODUCTS_SUPABASE.md` §4 for details.

---

## How RoomDimensions is used

**RoomDimensions** is optional context passed into the PM agent via `ProjectMetadata.dimensions`. It is used for **one technical rule today**:

- **40-inch rule (lighting in bathrooms only):** For bathroom walls where a mirror/vanity is planned, if the wall width is **under 40 inches**, the agent overrides any side-mounted sconce with a **horizontal overhead fixture**. This rule applies only to **lighting** slots in bathrooms; other slots (tile, hardware, countertop, etc.) are not considered.

So you only need to supply `RoomDimensions` when:

1. You have room dimensions (e.g. from builder takeoffs, user input, or room templates).
2. The room is a bathroom.
3. You want the PM agent to apply the sconce → overhead override for lighting in that room.

Fields used:

- `roomId` — matches the room (e.g. `primary_bath`, `guest_bath`).
- `wallWidthInches` — width of the relevant wall in inches.

If `dimensions` is omitted or empty, the 40-inch rule is skipped; no errors. Other dimension keys (e.g. ceiling height) can be added later for other rules.

---

## What IDs need to be in your material sourcelist DB vs interpretable

### IDs the system needs to resolve (from your DB or rules)

| Purpose | Where it lives | What you need |
|--------|----------------|----------------|
| **Material/slot identity** | PM agent swap maps, Creative Director selections | Stable **material IDs** (e.g. `stone.quartz_soft_white`, `flooring.marble_basketweave`, `metal.brass_lacquered_gold`) that both the agent and your sourcelist can use. These can be your own SKU or product keys. |
| **Swap / tier mapping** | `materialSwapMaps.ts`, PM agent logic | Either: (1) tags on each product in the DB (e.g. `material_family: stone`, `finish: unlacquered`, `tier: Luxury`), or (2) a small mapping table that says “this product ID is Luxury” / “swap from A to B”. |
| **Room dimensions** | Optional input to PM agent | Only if you want the 40-inch rule: store or compute `wallWidthInches` (and optionally other dimensions) per room. Can come from builder takeoffs or templates, not from the product DB. |

### What can be interpreted (no need to tag every product)

- **Tier (Value / Elevated / Luxury):** Can be inferred from category + price band or from a single “tier” or “finish_level” field on the product. You don’t need to tag every SKU by hand if you have rules (e.g. “all products in category X under $Y are Value”).
- **Rental-safe vs not:** Can be inferred from **material** and **finish** (e.g. “marble” → not rental-safe; “quartz”, “lacquered” → rental-safe). A small lookup or rule set is enough; no need to tag every SKU.
- **Fixture type (sconce vs overhead):** Only needed for lighting. Can come from category or product type (e.g. “sconce” vs “ceiling”) in the DB or from the product page.

So: **minimal tagging** is possible. You mainly need:

1. **Stable IDs** that the agents and Studio Coordinator use (can be SKU, or your own `material_id` / `product_id`).
2. **A few fields** that drive PM logic: material family (e.g. stone/metal/surface), finish (e.g. unlacquered/lacquered), and optionally tier. The rest can be inferred from category, price, or URL.

---

## Scalable approach: leverage product SKU / URL metadata

To avoid heavy manual tagging:

1. **Use product URL (or SKU) as the source of truth.** When you add a product to the sourcelist DB, store the `directLink` (and SKU). A future **Procurement Agent** (or a scraper) can refresh variable data (price, availability, lead time) from that URL.
2. **Store a small set of “rule” fields** that the PM agent needs:
   - Material family (e.g. stone, metal, tile, surface).
   - Finish (e.g. unlacquered, lacquered, PVD, polished).
   - Optional: tier (Value/Elevated/Luxury) or a rule to derive it (e.g. by category + price).
3. **Map agent material IDs to your DB.** Keep a table or config that maps PM/Creative Director material IDs (e.g. `stone.quartz_soft_white`) to one or more product IDs or SKUs in your DB. That way you don’t need to tag every product with agent IDs; only the products that appear in selection pools need that mapping.
4. **Let the Procurement Agent handle variable data.** Price, availability, and lead time should be updated from the product page or an API, not manually. Your schema already has `unitPrice`, `leadTime`, `stockStatus` — those are the fields the Procurement Agent can keep up to date.

If you share your current sheet (columns and a few example rows), we can map which columns should be **stored and tagged** vs **derived or refreshed** from URLs/APIs.
