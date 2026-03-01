"use client";

import React from "react";
import Image from "next/image";
import { useAppSelector } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { formatPrice, calcDiscountedPrice, calcDiscountPercentage } from "@/lib/utils";

// Displays a summary of the current cart contents and pricing breakdown
export default function OrderSummary() {
  const { cart, totalPrice, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );

  if (!cart || cart.items.length === 0) return null;

  const totalDiscount = totalPrice - adjustedTotalPrice;
  const discountPercent =
    totalPrice > 0 ? Math.round((totalDiscount / totalPrice) * 100) : 0;

  return (
    <div className="w-full p-5 md:px-6 flex flex-col space-y-4 md:space-y-5 rounded-[20px] border border-black/10">
      <h3 className="text-xl md:text-2xl font-bold text-black">
        Order Summary
      </h3>

      {/* Cart items */}
      <div className="flex flex-col space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {cart.items.map((item) => {
          const discountedPrice = calcDiscountedPrice(item.price, item.discount);
          return (
            <div key={item.id} className="flex items-center space-x-3">
              <div className="bg-[#F0EEED] rounded-lg w-[60px] h-[60px] min-w-[60px] flex items-center justify-center overflow-hidden">
                <Image
                  src={item.srcUrl}
                  width={60}
                  height={60}
                  className="object-contain w-full h-full"
                  alt={item.name}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">
                  {item.name}
                </p>
                <p className="text-xs text-black/60">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-black whitespace-nowrap">
                {formatPrice(discountedPrice * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <hr className="border-t-black/10" />

      {/* Price breakdown */}
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm md:text-base text-black/60">Subtotal</span>
          <span className="text-sm md:text-base font-bold">
            {formatPrice(totalPrice)}
          </span>
        </div>

        {discountPercent > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm md:text-base text-black/60">
              Discount (-{discountPercent}%)
            </span>
            <span className="text-sm md:text-base font-bold text-red-600">
              -{formatPrice(Math.round(totalDiscount))}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm md:text-base text-black/60">
            Delivery Fee
          </span>
          <span className="text-sm md:text-base font-bold">Free</span>
        </div>

        <hr className="border-t-black/10" />

        <div className="flex items-center justify-between">
          <span className="text-base md:text-lg font-medium text-black">
            Total
          </span>
          <span className="text-lg md:text-xl font-bold">
            {formatPrice(Math.round(adjustedTotalPrice))}
          </span>
        </div>
      </div>
    </div>
  );
}
