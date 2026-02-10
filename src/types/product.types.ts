// ──────────────────────────────────────────────
// New Firestore-backed Product type (Phase 2+)
// ──────────────────────────────────────────────

export type Discount = {
  amount: number;
  percentage: number;
};

export type LaptopSpecs = {
  processor: string;
  ram: string;
  storage: string;
  gpu: string;
  screenSize: string;
  display: string;
  os: string;
  weight: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  cost: number;
  category: "gaming" | "business" | "ultrabook" | "student" | "workstation";
  specs: LaptopSpecs;
  images: string[];
  tags: string[];
  description: string;
  aiSummary?: string;
  discount: Discount;
  rating: number;
  viewCount: number;
  salesCount: number;
  featured: boolean;
  onSale: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ──────────────────────────────────────────────
// Legacy Product type (used by existing hardcoded pages)
// Will be removed in Phase 2 when pages are migrated
// ──────────────────────────────────────────────

export type LegacyProduct = {
  id: number;
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
};
