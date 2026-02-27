# Master Products → Supabase + pgVector

This doc maps your **Revy Master Products** CSV to a Supabase schema and explains when/how to use **pgVector** for semantic search. Your CSV columns are already well-aligned with PM agent rules and Creative Director style logic.

---

## 1. CSV columns → what you have

From your **Revy MasterProducts - Master Products.csv**:

| Column | Use in app | PM agent / rules | Variable? (Procurement) |
|--------|------------|------------------|--------------------------|
| `vendor` | Source, link | — | — |
| `vendor_sku` | Unique product id (with vendor) | — | — |
| `category` | Tile, Stone, Metal, etc. | Slot/category filter | — |
| `subcategory` | tile, etc. | — | — |
| `title`, `description` | Display, search | — | — |
| `url` | Direct link (Procurement can refresh from here) | — | — |
| `image_url1`–`image_url3` | Thumbnails, moodboard | — | — |
| `price`, `currency` | Cost, budget | — | **Yes** |
| `width_in`, `depth_in`, `height_in`, `length_in`, `diameter_in` | Dimensions, 40-inch rule | **RoomDimensions** (if you store room-level dims separately) | — |
| `finish` | honed, glazed, matte, etc. | **Rental swap**: unlacquered/raw → lacquered | — |
| `material` | marble, porcelain, zellige, limestone, cement, stone | **Rental swap**: marble/limestone/terracotta → quartz/porcelain; **Finish tier** veto | — |
| `color` | Display, filters | — | — |
| `style_notes`, `tags` | Style matching, search | Can infer tier / rental-safe from tags | — |
| `forms` | mosaic, etc. | — | — |
| `archetype_hint` | parisian, mediterranean, provincial | Creative Director | — |
| `modern_rustic`, `minimal_maximal`, `bright_moody` | Style axes (styleWeights) | — | — |
| `room_type`, `install_type` | Where it goes | — | — |
| `lead_time_days` | Sequencing, FS-02 | — | **Yes** |
| `shipping_notes` | — | — | **Yes** |
| `in_stock`, `discontinued` | Availability | — | **Yes** |
| `application` | floor, wall, shower, etc. | 40-inch rule: lighting install_type | — |
| `wet_location_rating`, `bathroom_wetroom_ok` | PM / feasibility | — | — |
| `finish_family`, `metal_match_key`, `compatibility_key` | PM metal/stone rules | **Rental** metal swap | — |
| `price_unit`, `coverage_per_unit_sqft` | Costing | — | — |

Product-level dimensions (`width_in`, etc.) describe the **product**. The PM agent’s **RoomDimensions** (e.g. bathroom wall &lt; 40") are **room** attributes (from takeoffs or templates), not per-SKU — so you don’t need to change product rows for the 40-inch rule; you pass room dimensions into the PM agent separately.

---

## 2. Do you need pgVector?

**pgVector** is for **vector similarity search** (embeddings). Use it when you want to:

- **Semantic product search**: e.g. “tiles that feel like warm Mediterranean zellige” or “calm, minimal marble look” by embedding `title + description + tags + style_notes` and querying with an embedding of the user’s style or the Creative Director’s brief.
- **Creative Director**: recommend products by similarity to an archetype or a text brief (instead of or in addition to exact `archetype_hint` / `tags` filters).

You **do not** need pgVector for:

- **PM agent logic**: fiscal audit, rental/flip swaps, finish tier, 40-inch rule — all use `material`, `finish`, `finish_family`, and rule-based maps. Normal columns and indexes are enough.
- **Filtering** by category, material, finish, price, lead time — standard B-tree indexes are sufficient.

**Recommendation:** Add pgVector when you implement **semantic product search** or **style-based recommendation** (Creative Director pulling from Master Products). Until then, your current columns are enough for PM and for filter-based selection.

---

## 3. Supabase schema (no pgVector yet)

Minimal table that mirrors your CSV and stays compatible with PM + Procurement:

```sql
-- Master products (import from CSV; sync via Procurement for variable fields)
create table public.master_products (
  id uuid primary key default gen_random_uuid(),
  vendor text not null,
  vendor_sku text not null,
  unique (vendor, vendor_sku),

  category text not null,
  subcategory text,
  title text not null,
  description text,
  url text,
  image_url1 text,
  image_url2 text,
  image_url3 text,

  price numeric(12,2),
  currency text default 'USD',
  price_unit text,
  coverage_per_unit_sqft numeric,

  width_in numeric,
  depth_in numeric,
  height_in numeric,
  length_in numeric,
  diameter_in numeric,

  finish text,
  material text not null,
  color text,
  finish_family text,
  metal_match_key text,
  compatibility_key text,

  style_notes text,
  tags text,
  forms text,
  archetype_hint text,
  modern_rustic numeric,
  minimal_maximal numeric,
  bright_moody numeric,

  room_type text,
  install_type text,
  application text,
  indoor_outdoor text,
  wet_location_rating text,
  bathroom_wetroom_ok boolean,

  lead_time_days int,
  shipping_notes text,
  in_stock boolean,
  discontinued boolean,
  notes_private text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for PM and filters
create index idx_mp_material on public.master_products(material);
create index idx_mp_finish on public.master_products(finish);
create index idx_mp_category on public.master_products(category);
create index idx_mp_archetype on public.master_products(archetype_hint);
create index idx_mp_in_stock on public.master_products(in_stock) where not discontinued;
```

Use a **composite key** `(vendor, vendor_sku)` as the stable product id in the app (e.g. `"cletile.Z20026"`).

---

## 4. Creative Director ↔ PM loop (no “linking” step)

In the **loop** design, there is **no separate step** where the PM returns an abstract ID that you then “link” to the DB.

1. **Creative Director** queries the DB (e.g. by style, archetype, slot) and returns **real products** — multiple per slot — with `vendor`, `vendor_sku`, `material`, `finish`, `price`, etc. (the `ProductCandidate` shape).
2. **Project Manager** receives that list and, for each slot, applies **finish/scope rules first** (e.g. rental: drop marble; 40-inch rule only for lighting in bathrooms: drop sconces in narrow baths), then **budget** (e.g. prefer lower price when tight), and **selects exactly one product per slot**. The PM output is already the **chosen product rows** (or their ids).
3. **Studio Coordinator** uses the selected product’s `vendor`, `vendor_sku`, `url`, and `scopeReasoning` directly for the Decision Details table and sourcelist. No “resolve material ID to product” step — the PM is choosing from real products the CD supplied.

So you do **not** need a `revy_material_id` column or a rule-based “resolve ID to product” layer for this flow. The only requirement is that the Creative Director returns at least one candidate per slot so the PM can always return one product per slot (no nulls).

---

## 5. Adding pgVector later (semantic search)

When you want semantic “find products like this” or “match this style description”:

1. **Enable pgVector** in the Supabase project (Database → Extensions → `vector`).
2. **Add an embedding column** (e.g. 1536 dimensions for OpenAI `text-embedding-3-small`):

```sql
alter table public.master_products
  add column embedding vector(1536);
```

3. **Fill embeddings** from `title || ' ' || coalesce(description,'') || ' ' || coalesce(tags,'') || ' ' || coalesce(style_notes,'')` (or a cleaned version) via a one-off script or a Supabase Edge Function / cron that calls your embedding API.
4. **Create the vector index** (IVFFlat or HNSW):

```sql
create index idx_mp_embedding on public.master_products
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
```

5. **Query** with the Creative Director’s style text (or user’s brief) embedded, e.g.:

```sql
select id, vendor, vendor_sku, title, material, finish,
       1 - (embedding <=> $1::vector) as similarity
from public.master_products
where embedding is not null and not discontinued
order by embedding <=> $1::vector
limit 20;
```

No need to add pgVector until you implement this style-based retrieval path; your current CSV columns already support PM agent rules and filter-based selection.

---

## 6. Procurement Agent (variable data)

Fields that should be updated over time (e.g. from `url` or an API):

- `price`, `currency`
- `lead_time_days`, `shipping_notes`
- `in_stock`, `discontinued`

Keep these in the same `master_products` table; the Procurement Agent can run on a schedule or on-demand and update only these columns. No schema change required beyond the table above.
