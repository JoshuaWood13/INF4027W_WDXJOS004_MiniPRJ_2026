import type { PaymentType } from "./order.types";

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
  address: Address;
  paymentType: PaymentType;
};

export type AutoBuyMessage = {
  id: string;
  productName: string;
  pricePaid: number;
  orderId: string;
  createdAt: Date;
};

export type AppUser = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  addresses: SavedAddress[]; // Up to 3 saved addresses
  wishlist: string[]; // Array of product IDs
  priceWatchers: PriceWatcher[]; // Array of price watchers
  autoBuyMessages: AutoBuyMessage[]; // Auto-buy activity feed
  friendCode: string; // 8-char alphanumeric mixed-case, unique
  friends: string[]; // Array of friend UIDs
  incomingRequests: IncomingRequest[]; // Pending friend requests received
  outgoingRequests: OutgoingRequest[]; // Pending friend requests sent
  createdAt: Date;
};

/** A friend request received by the current user */
export type IncomingRequest = {
  fromUid: string;
  fromDisplayName: string;
  sentAt: Date;
};

/** A friend request sent by the current user */
export type OutgoingRequest = {
  toUid: string;
  sentAt: Date;
};
