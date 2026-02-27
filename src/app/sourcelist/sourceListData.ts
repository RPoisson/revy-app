// Source List — Studio Coordinator Agent.
// Master list of material selections from moodboard + decision detail tables.
//
// Integration (when ready):
// - DB: Store specifications per material item (vendor, SKU, dimensions, pricing, lead time, etc.).
//   Each row can be keyed by project + room + slot/category (or itemId) and joined with
//   design concept selections.
// - Agent loop: Creator Agent (aesthetic choices) and Project Manager Agent (scope/budget)
//   can produce or approve selections; Studio Coordinator consumes those + DB specs to
//   render this source list. Replace getPlaceholderSourceList() with an API that:
//   (1) reads material selections from the design concept / agent outputs, and
//   (2) enriches each row with DB specs (vendor, SKU, unitPrice, etc.).
//
// This module defines the schema and placeholder data until the above is connected.

export type SourceItem = {
  id: string;
  phase: 1 | 2 | 3;
  category: string;
  room: string;
  productName: string;
  itemId: string;
  vendor: string;
  manufacturer: string;
  sku: string;
  directLink: string;
  finish: string;
  material: string;
  dimensions: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  tradeDiscount: string;
  leadTime: string;
  stockStatus: "In Stock" | "Low Stock" | "Made to Order" | "Backordered";
};

export const phaseConfig = {
  1: {
    label: "Phase 1",
    tag: "Rough-In & Foundational",
    description:
      "Order immediately — must be on-site at the start of construction before walls can be closed.",
  },
  2: {
    label: "Phase 2",
    tag: "Finish & Surface",
    description: "Visible fixtures and surfaces installed once walls are closed.",
  },
  3: {
    label: "Phase 3",
    tag: "Decorative & Final Touch",
    description: "Final-touch elements installed at project completion.",
  },
} as const;

export type PhaseCategory = {
  name: string;
  reason: string;
  count: number;
};

export const phaseCategories: Record<1 | 2 | 3, PhaseCategory[]> = {
  1: [
    { name: "Plumbing Rough-ins", reason: "Internal valves and drain assemblies that must be set before walls close.", count: 2 },
    { name: "Appliance Specifications", reason: "Required for framing dimensions and utility hookup placement.", count: 1 },
    { name: "Floor & Wall Tile", reason: "Contractors need these on-site early for material thickness and transitions.", count: 0 },
    { name: "Wet-Area Cabinetry", reason: "Bathroom vanities and laundry cabinets that dictate pipe and wall placement.", count: 2 },
  ],
  2: [
    { name: "Plumbing Trim", reason: "The visible faucets, shower heads, and handles.", count: 2 },
    { name: "Countertops/Stone Slabs", reason: "Cannot be finalized until cabinetry is installed for templating.", count: 1 },
    { name: "Cabinetry Finish Work", reason: "Final panels and door fronts.", count: 1 },
  ],
  3: [
    { name: "Lighting Fixtures", reason: "Sconces and pendants.", count: 2 },
    { name: "Hardware", reason: "Cabinet knobs and pulls, towel hooks.", count: 2 },
    { name: "Mirrors", reason: "Final wall-mounted decorative elements.", count: 1 },
  ],
};

/**
 * Placeholder source list. Replace with:
 * - fetch from your DB (specs per material item per room/slot)
 * - or build from design concept materials + DB lookup by slot/room/category
 */
export function getPlaceholderSourceList(): SourceItem[] {
  return [
    {
      id: "SL-001",
      phase: 1,
      category: "Floor Tile",
      room: "Primary Bathroom",
      productName: "Honed Marble Hex Tile",
      itemId: "PB-FLR-01",
      vendor: "Tile Bar",
      manufacturer: "Artistic Tile",
      sku: "AT-HMH-12",
      directLink: "https://www.tilebar.com",
      finish: "Honed White",
      material: "Carrara Marble",
      dimensions: "12\" x 12\" sheet",
      quantity: 45,
      unitPrice: 28,
      totalCost: 1260,
      tradeDiscount: "Trade Only",
      leadTime: "3–4 weeks",
      stockStatus: "In Stock",
    },
    {
      id: "SL-002",
      phase: 1,
      category: "Wall Tile",
      room: "Primary Bathroom",
      productName: "Zellige Subway Tile",
      itemId: "PB-WLL-01",
      vendor: "Clé Tile",
      manufacturer: "Clé",
      sku: "CLE-ZLG-SW",
      directLink: "https://www.cletile.com",
      finish: "Weathered White",
      material: "Zellige Clay",
      dimensions: "2.5\" x 8\"",
      quantity: 120,
      unitPrice: 15,
      totalCost: 1800,
      tradeDiscount: "20% Trade",
      leadTime: "4–6 weeks",
      stockStatus: "Made to Order",
    },
    {
      id: "SL-003",
      phase: 1,
      category: "Vanity",
      room: "Primary Bathroom",
      productName: "60\" Double Vanity",
      itemId: "PB-VAN-01",
      vendor: "Build.com",
      manufacturer: "James Martin",
      sku: "JM-825-V60D",
      directLink: "https://www.build.com",
      finish: "White Oak",
      material: "Solid Wood",
      dimensions: "60\" W x 22\" D x 34\" H",
      quantity: 1,
      unitPrice: 2850,
      totalCost: 2850,
      tradeDiscount: "10% NET",
      leadTime: "6–8 weeks",
      stockStatus: "Low Stock",
    },
    {
      id: "SL-004",
      phase: 2,
      category: "Plumbing Trim",
      room: "Primary Bathroom",
      productName: "Wall-Mount Faucet",
      itemId: "PB-FAU-01",
      vendor: "Quality Bath",
      manufacturer: "Waterworks",
      sku: "WW-14-92834",
      directLink: "https://www.qualitybath.com",
      finish: "Unlacquered Brass",
      material: "Solid Brass",
      dimensions: "8\" spread",
      quantity: 2,
      unitPrice: 1250,
      totalCost: 2500,
      tradeDiscount: "Trade Only",
      leadTime: "4–6 weeks",
      stockStatus: "In Stock",
    },
    {
      id: "SL-005",
      phase: 2,
      category: "Countertop",
      room: "Kitchen",
      productName: "Calacatta Oro Slab",
      itemId: "KT-CTR-01",
      vendor: "ABC Stone",
      manufacturer: "Imported",
      sku: "ABC-CALC-ORO",
      directLink: "https://www.abcstone.com",
      finish: "Polished",
      material: "Natural Marble",
      dimensions: "120\" x 65\" slab",
      quantity: 2,
      unitPrice: 4200,
      totalCost: 8400,
      tradeDiscount: "NET 30",
      leadTime: "2–3 weeks",
      stockStatus: "In Stock",
    },
    {
      id: "SL-006",
      phase: 3,
      category: "Lighting",
      room: "Primary Bathroom",
      productName: "Articulating Sconce",
      itemId: "PB-LIT-01",
      vendor: "Circa Lighting",
      manufacturer: "Visual Comfort",
      sku: "VC-ARN2065",
      directLink: "https://www.circalighting.com",
      finish: "Antique Brass",
      material: "Brass/Linen",
      dimensions: "5\" W x 19\" H",
      quantity: 2,
      unitPrice: 420,
      totalCost: 840,
      tradeDiscount: "15% Trade",
      leadTime: "2–3 weeks",
      stockStatus: "In Stock",
    },
    {
      id: "SL-007",
      phase: 3,
      category: "Hardware",
      room: "Kitchen",
      productName: "Drawer Pull 5\"",
      itemId: "KT-HDW-01",
      vendor: "Rejuvenation",
      manufacturer: "Rejuvenation",
      sku: "REJ-A4520",
      directLink: "https://www.rejuvenation.com",
      finish: "Aged Brass",
      material: "Solid Brass",
      dimensions: "5\" CC",
      quantity: 32,
      unitPrice: 38,
      totalCost: 1216,
      tradeDiscount: "Trade 20%",
      leadTime: "1–2 weeks",
      stockStatus: "In Stock",
    },
    {
      id: "SL-008",
      phase: 1,
      category: "Floor Tile",
      room: "Kitchen",
      productName: "Backsplash — Zellige",
      itemId: "KT-WLL-01",
      vendor: "Clé Tile",
      manufacturer: "Clé",
      sku: "CLE-ZLG-SG",
      directLink: "https://www.cletile.com",
      finish: "Sea Green",
      material: "Zellige Clay",
      dimensions: "2\" x 6\"",
      quantity: 60,
      unitPrice: 18,
      totalCost: 1080,
      tradeDiscount: "20% Trade",
      leadTime: "4–6 weeks",
      stockStatus: "Made to Order",
    },
  ];
}
