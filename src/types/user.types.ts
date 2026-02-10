export type UserRole = "customer" | "admin";

export type Address = {
  street: string;
  city: string;
  province: string;
  postalCode: string;
};

export type PriceWatcher = {
  productId: string;
  targetPrice: number;
};

export type AppUser = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  address?: Address;
  wishlist: string[]; // Array of product IDs
  priceWatchers: PriceWatcher[]; // Array of {productId, targetPrice}
  createdAt: Date;
};
