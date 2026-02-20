import { Address } from "./user.types";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type PaymentType = "EFT" | "Card" | "Cash on Delivery";

export type OrderStatus = "pending" | "complete";

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  totalCost: number;
  shippingAddress: Address;
  paymentType: PaymentType;
  status: OrderStatus;
  isGift: boolean;
  giftRecipientId?: string;
  giftRecipientAddress?: Address;
  giftMessage?: string;
  isAutoBuy: boolean;
  createdAt: Date;
  updatedAt: Date;
};
