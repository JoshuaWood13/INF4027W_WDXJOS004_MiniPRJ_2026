export type UserRole = "customer" | "admin";

export type Address = {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
};

export type AddressType = "Residential" | "Business";

export type SavedAddress = Address & {
  id: string;
  addressType: AddressType;
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
  addresses: SavedAddress[]; // Up to 3 saved addresses
  wishlist: string[]; // Array of product IDs
  priceWatchers: PriceWatcher[]; // Array of {productId, targetPrice}
  createdAt: Date;
};
