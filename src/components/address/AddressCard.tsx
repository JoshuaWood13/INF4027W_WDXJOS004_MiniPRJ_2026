"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SavedAddress } from "@/types/user.types";

type AddressCardProps = {
  address: SavedAddress;
  selected?: boolean;
  onSelect?: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function AddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: AddressCardProps) {
  const selectable = onSelect !== undefined;

  const Wrapper = selectable ? "button" : "div";
  const wrapperProps = selectable
    ? { type: "button" as const, onClick: onSelect }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "w-full text-left rounded-xl border p-4 transition-colors",
        selectable && selected
          ? "border-black bg-black/[0.03]"
          : "border-black/10 hover:border-black/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Radio indicator */}
          {selectable && (
            <div className="mt-1 shrink-0">
              <div
                className={cn(
                  "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center",
                  selected ? "border-black" : "border-black/30"
                )}
              >
                {selected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-black" />
                )}
              </div>
            </div>
          )}

          {/* Address details */}
          <div className="flex-1 min-w-0">
            {/* Type badge */}
            <span
              className={cn(
                "inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5",
                address.addressType === "Residential"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              )}
            >
              {address.addressType}
            </span>

            <p className="text-sm font-semibold text-black truncate">
              {address.street}
            </p>
            <p className="text-sm text-black/70">
              {address.suburb}
              {address.suburb && ", "}
              {address.city}, {address.postalCode}
            </p>
            <p className="text-xs text-black/40 mt-0.5">{address.province}</p>
          </div>
        </div>

        {/* edit/delete */}
        <div
          className="flex items-center gap-2 shrink-0 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Delete
          </button>
          <span className="text-black/20">|</span>
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-black/60 hover:text-black font-medium transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </Wrapper>
  );
}
