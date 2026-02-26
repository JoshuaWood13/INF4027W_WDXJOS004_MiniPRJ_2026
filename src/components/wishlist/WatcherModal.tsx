"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/types/product.types";
import { PriceWatcher, SavedAddress } from "@/types/user.types";
import { PaymentType } from "@/types/order.types";
import { addPriceWatcher, removePriceWatcher } from "@/lib/firestore/users";
import { formatPrice, calcDiscountedPrice } from "@/lib/utils";
import Link from "next/link";

const PAYMENT_TYPES: PaymentType[] = ["EFT", "Card", "Cash on Delivery"];

type WatcherModalProps = {
  product: Product;
  existingWatcher: PriceWatcher | null;
  userUid: string;
  savedAddresses: SavedAddress[];
  onClose: () => void;
  onSaved: () => void;
};

export default function WatcherModal({
  product,
  existingWatcher,
  userUid,
  savedAddresses,
  onClose,
  onSaved,
}: WatcherModalProps) {
  const effectivePrice = calcDiscountedPrice(product.price, product.discount);

  const [targetPrice, setTargetPrice] = useState(
    String(existingWatcher?.targetPrice ?? effectivePrice),
  );
  const [selectedAddressId, setSelectedAddressId] = useState(
    existingWatcher?.address
      ? // Match existing watcher address to a saved address by street
        (savedAddresses.find((a) => a.street === existingWatcher.address.street)
          ?.id ??
          savedAddresses[0]?.id ??
          "")
      : (savedAddresses[0]?.id ?? ""),
  );
  const [paymentType, setPaymentType] = useState<PaymentType>(
    existingWatcher?.paymentType ?? "EFT",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Re-sync if modal is reopened with different product data
  useEffect(() => {
    setTargetPrice(String(existingWatcher?.targetPrice ?? effectivePrice));
    setPaymentType(existingWatcher?.paymentType ?? "EFT");
    setSelectedAddressId(
      existingWatcher?.address
        ? (savedAddresses.find(
            (a) => a.street === existingWatcher.address.street,
          )?.id ??
            savedAddresses[0]?.id ??
            "")
        : (savedAddresses[0]?.id ?? ""),
    );
  }, [existingWatcher, product.price, savedAddresses]);

  const selectedAddress = savedAddresses.find(
    (a) => a.id === selectedAddressId,
  );

  // Validate and save the watcher
  async function handleSave() {
    setError("");

    const parsedPrice = Number(targetPrice);

    if (!targetPrice || parsedPrice <= 0) {
      setError("Target price must be greater than 0.");
      return;
    }
    if (parsedPrice >= effectivePrice) {
      setError(
        `Target price must be below the current price (${formatPrice(effectivePrice)}).`,
      );
      return;
    }
    if (!selectedAddress) {
      setError("Please select a delivery address.");
      return;
    }

    // Build the new watcher
    const { id: _id, addressType: _type, ...addressOnly } = selectedAddress;
    const newWatcher: PriceWatcher = {
      productId: product.id,
      targetPrice: parsedPrice,
      address: addressOnly,
      paymentType,
    };

    setSaving(true);
    try {
      // If editing, remove old watcher first then add new one
      if (existingWatcher) {
        await removePriceWatcher(userUid, existingWatcher);
      }
      await addPriceWatcher(userUid, newWatcher);
      onSaved();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save watcher. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Watch Price — {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Target price */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Auto-buy product when price drops to or below
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black/50">R</span>
              <input
                type="number"
                min={1}
                step={1}
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="flex-1 border border-black/10 rounded-full py-3 px-4 text-sm outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-colors bg-[#F0F0F0]"
              />
            </div>
            <p className="text-xs text-black/40 mt-1.5 ml-1">
              Current price: {formatPrice(effectivePrice)}
              {effectivePrice < product.price && (
                <span className="ml-1 line-through text-black/25">
                  {formatPrice(product.price)}
                </span>
              )}
            </p>
          </div>

          {/* Delivery address */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Delivery address
            </label>
            {savedAddresses.length === 0 ? (
              <p className="text-sm text-black/50">
                No addresses saved.{" "}
                <Link
                  href="/account/addresses"
                  className="underline hover:text-black transition-colors"
                  onClick={onClose}
                >
                  Add one in Account
                </Link>
                .
              </p>
            ) : (
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full border border-black/10 rounded-full py-3 px-4 text-sm outline-none focus:border-black/30 bg-[#F0F0F0] appearance-none"
              >
                {savedAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.street}, {addr.city} ({addr.addressType})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Payment method
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              className="w-full border border-black/10 rounded-full py-3 px-4 text-sm outline-none focus:border-black/30 bg-[#F0F0F0] appearance-none"
            >
              {PAYMENT_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || savedAddresses.length === 0}
              className="flex-1 bg-black text-white rounded-full py-3 text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving..."
                : existingWatcher
                  ? "Update watcher"
                  : "Set watcher"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-black/10 rounded-full py-3 text-sm font-medium hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
