"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PaymentType } from "@/types/order.types";
import { BsBank2 } from "react-icons/bs";
import { FiCreditCard } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";

type PaymentOption = {
  type: PaymentType;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    type: "EFT",
    label: "EFT",
    description: "Electronic Funds Transfer via bank",
    icon: <BsBank2 className="text-xl" />,
  },
  {
    type: "Card",
    label: "Card",
    description: "Credit or Debit card payment",
    icon: <FiCreditCard className="text-xl" />,
  },
  {
    type: "Cash on Delivery",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: <TbTruckDelivery className="text-xl" />,
  },
];

type PaymentSelectorProps = {
  selected: PaymentType | null;
  onSelect: (type: PaymentType) => void;
};

export default function PaymentSelector({
  selected,
  onSelect,
}: PaymentSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {PAYMENT_OPTIONS.map((option) => {
        const isSelected = selected === option.type;

        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onSelect(option.type)}
            className={cn(
              "w-full text-left rounded-xl border p-4 transition-colors",
              isSelected
                ? "border-black bg-black/[0.03]"
                : "border-black/10 hover:border-black/30"
            )}
          >
            <div className="flex items-center gap-4">
              {/* Radio indicator */}
              <div
                className={cn(
                  "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
                  isSelected ? "border-black" : "border-black/30"
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-black" />
                )}
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  isSelected ? "bg-black text-white" : "bg-black/5 text-black/60"
                )}
              >
                {option.icon}
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black">
                  {option.label}
                </p>
                <p className="text-xs text-black/50">{option.description}</p>
              </div>
            </div>
          </button>
        );
      })}

      <p className="text-xs text-black/40 mt-1">
        Payment is simulated — no real charges will be made.
      </p>
    </div>
  );
}
