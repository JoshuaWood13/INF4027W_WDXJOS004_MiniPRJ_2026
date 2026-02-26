"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { SavedAddress } from "@/types/user.types";
import {
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "@/lib/firestore/users";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import { FiPlus } from "react-icons/fi";
import { showSuccessToast } from "@/components/ui/SuccessToast";

const MAX_ADDRESSES = 3;

type View = "cards" | "add" | "edit";

type AddressManagerProps = {
  selectedId?: string | null;
  onSelect?: (address: SavedAddress | null) => void;
  /** Defaults to "Delivery Address". */
  heading?: string;
};

export default function AddressManager({
  selectedId = null,
  onSelect,
  heading = "Delivery Address",
}: AddressManagerProps) {
  const { appUser, refreshAppUser } = useAuth();
  const [view, setView] = useState<View>("cards");
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null
  );
  const [error, setError] = useState("");

  const addresses = appUser?.addresses ?? [];
  const canAddMore = addresses.length < MAX_ADDRESSES;

  // Handlers

  async function handleSaveNew(address: SavedAddress) {
    if (!appUser) return;
    setError("");

    try {
      await addUserAddress(appUser.uid, address);
      await refreshAppUser();
      showSuccessToast("Address added!");
      // auto select newly created address
      onSelect?.(address);
      setView("cards");
    } catch (err: any) {
      setError(err?.message || "Failed to save address.");
    }
  }

  async function handleSaveEdit(address: SavedAddress) {
    if (!appUser) return;
    setError("");

    try {
      await updateUserAddress(appUser.uid, address);
      await refreshAppUser();
      showSuccessToast("Address updated!");
      // If edited address was selected, update the selection
      if (selectedId === address.id) {
        onSelect?.(address);
      }
      setEditingAddress(null);
      setView("cards");
    } catch (err: any) {
      setError(err?.message || "Failed to update address.");
    }
  }

  async function handleDelete(addressId: string) {
    if (!appUser) return;
    setError("");

    try {
      await deleteUserAddress(appUser.uid, addressId);
      await refreshAppUser();
      showSuccessToast("Address deleted!");

      // If deleted address was selected, select another or null
      if (selectedId === addressId) {
        const remaining = addresses.filter((a) => a.id !== addressId);
        onSelect?.(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete address.");
    }
  }

  function handleEdit(address: SavedAddress) {
    setEditingAddress(address);
    setView("edit");
  }

  function handleCancelForm() {
    setEditingAddress(null);
    setView("cards");
  }

  // Error banner
  const errorBanner = error ? (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
      {error}
    </div>
  ) : null;

  // Add / Edit form view
  if (view === "add") {
    return (
      <div>
        {errorBanner}
        <AddressForm onSave={handleSaveNew} onCancel={handleCancelForm} />
      </div>
    );
  }

  if (view === "edit" && editingAddress) {
    return (
      <div>
        {errorBanner}
        <AddressForm
          initial={editingAddress}
          onSave={handleSaveEdit}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  // Cards view

  if (addresses.length === 0) {
    return (
      <div>
        {errorBanner}
        <div className="flex flex-col items-center py-8">
          <p className="text-sm text-black/40 mb-4">
            No saved addresses yet.
          </p>
          <button
            type="button"
            onClick={() => setView("add")}
            className="flex items-center gap-2 bg-black text-white rounded-full py-2.5 px-5 text-sm font-medium hover:bg-black/80 transition-colors"
          >
            <FiPlus className="text-base" />
            Add Address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {errorBanner}

      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold">{heading}</h4>
        {canAddMore && (
          <button
            type="button"
            onClick={() => setView("add")}
            className="flex items-center gap-1.5 bg-black text-white rounded-full py-2 px-4 text-xs font-medium hover:bg-black/80 transition-colors"
          >
            <FiPlus className="text-sm" />
            Add Address
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            address={addr}
            {...(onSelect
              ? {
                  selected: selectedId === addr.id,
                  onSelect: () => onSelect(addr),
                }
              : {})}
            onEdit={() => handleEdit(addr)}
            onDelete={() => handleDelete(addr.id)}
          />
        ))}
      </div>
    </div>
  );
}
