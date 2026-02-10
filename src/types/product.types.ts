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

export type ProductCategory =
  | "gaming"
  | "business"
  | "ultrabook"
  | "student"
  | "workstation";

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  cost: number;
  category: ProductCategory;
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
