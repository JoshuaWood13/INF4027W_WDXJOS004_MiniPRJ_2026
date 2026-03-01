import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Discount } from "@/types/product.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const compareArrays = (a: any[], b: any[]) => {
  return a.toString() === b.toString();
};

/** Generate a random 8-character alphanumeric mixed-case friend code */
export function generateFriendCode(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Format a number as ZAR currency (e.g., R 12,999) */
export function formatPrice(price: number): string {
  return `R ${price.toLocaleString("en-ZA")}`;
}

/** Calculate discounted price */
export function calcDiscountedPrice(price: number, discount: Discount): number {
  if (discount.percentage > 0) {
    return Math.round(price - (price * discount.percentage) / 100);
  }
  if (discount.amount > 0) {
    return Math.round(price - discount.amount);
  }
  return price;
}

/** Calculate the effective discount percentage (for both percentage and fixed amount discounts) */
export function calcDiscountPercentage(
  price: number,
  discount: Discount,
): number {
  if (discount.percentage > 0) return discount.percentage;
  if (discount.amount > 0 && price > 0)
    return Math.round((discount.amount / price) * 100);
  return 0;
}

/** Placeholder image path for missing product images */
export const PLACEHOLDER_IMAGE = "/images/placeholder-laptop.svg";
