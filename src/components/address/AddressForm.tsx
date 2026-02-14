"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AddressType, SavedAddress } from "@/types/user.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
] as const;

type AddressFormFields = {
  addressType: AddressType;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
};

type FormErrors = Partial<Record<keyof AddressFormFields, string>>;

type AddressFormProps = {
  initial?: SavedAddress;
  onSave: (address: SavedAddress) => Promise<void> | void;
  onCancel: () => void;
};

const inputClass = "w-full border border-black/10 rounded-full py-3 px-4 text-sm outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-colors bg-[#F0F0F0]";

const labelClass = "block text-sm font-medium mb-1.5";

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export default function AddressForm({
  initial,
  onSave,
  onCancel,
}: AddressFormProps) {
  const [fields, setFields] = useState<AddressFormFields>({
    addressType: initial?.addressType ?? "Residential",
    street: initial?.street ?? "",
    suburb: initial?.suburb ?? "",
    city: initial?.city ?? "",
    province: initial?.province ?? "",
    postalCode: initial?.postalCode ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof AddressFormFields>(
    key: K,
    value: AddressFormFields[K]
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  // Validate form fields
  function validate(): boolean {
    const errs: FormErrors = {};
    if (!fields.street.trim()) errs.street = "Street address is required.";
    if (!fields.city.trim()) errs.city = "City is required.";
    if (!fields.province) errs.province = "Province is required.";
    if (!fields.postalCode.trim()) errs.postalCode = "Postal code is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    setSaving(true);
    try {
      const address: SavedAddress = {
        id: initial?.id ?? generateId(),
        addressType: fields.addressType,
        street: fields.street.trim(),
        suburb: fields.suburb.trim(),
        city: fields.city.trim(),
        province: fields.province,
        postalCode: fields.postalCode.trim(),
      };
      await onSave(address);
    } catch (err) {
      console.error("Failed to save address:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h4 className="text-lg font-bold mb-4">
        {initial ? "Edit Address" : "Add New Address"}
      </h4>

      <div className="space-y-4">
        {/* Address type */}
        <div>
          <span className={labelClass}>Address Type</span>
          <div className="flex gap-3 mt-1">
            {(["Residential", "Business"] as AddressType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField("addressType", type)}
                className={cn(
                  "flex items-center gap-2 border rounded-full py-2.5 px-4 text-sm font-medium transition-colors",
                  fields.addressType === type
                    ? "border-black bg-black text-white"
                    : "border-black/10 text-black/60 hover:border-black/30"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Street */}
        <div>
          <label htmlFor="addr-street" className={labelClass}>
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-street"
            type="text"
            value={fields.street}
            onChange={(e) => updateField("street", e.target.value)}
            placeholder="e.g. 12 Ridge Street"
            className={inputClass}
            disabled={saving}
          />
          {errors.street && (
            <p className="text-red-500 text-xs mt-1">{errors.street}</p>
          )}
        </div>

        {/* Suburb */}
        <div>
          <label htmlFor="addr-suburb" className={labelClass}>
            Suburb
          </label>
          <input
            id="addr-suburb"
            type="text"
            value={fields.suburb}
            onChange={(e) => updateField("suburb", e.target.value)}
            placeholder="e.g. Bel Ombre"
            className={inputClass}
            disabled={saving}
          />
        </div>

        {/* City + Province */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="addr-city" className={labelClass}>
              City / Town <span className="text-red-500">*</span>
            </label>
            <input
              id="addr-city"
              type="text"
              value={fields.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="e.g. Cape Town"
              className={inputClass}
              disabled={saving}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Province <span className="text-red-500">*</span>
            </label>
            <Select
              value={fields.province}
              onValueChange={(val) => updateField("province", val)}
              disabled={saving}
            >
              <SelectTrigger
                className={cn(
                  "rounded-full h-[46px] px-4 text-sm bg-[#F0F0F0] border-black/10 focus:ring-black/10",
                  !fields.province && "text-black/40"
                )}
              >
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {SA_PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.province && (
              <p className="text-red-500 text-xs mt-1">{errors.province}</p>
            )}
          </div>
        </div>

        {/* Postal Code */}
        <div className="max-w-[200px]">
          <label htmlFor="addr-postal" className={labelClass}>
            Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            id="addr-postal"
            type="text"
            value={fields.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            placeholder="e.g. 7700"
            className={inputClass}
            disabled={saving}
          />
          {errors.postalCode && (
            <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="border border-black/10 text-black rounded-full py-2.5 px-6 text-sm font-medium hover:bg-black/5 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white rounded-full py-2.5 px-6 text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Address"}
        </button>
      </div>
    </div>
  );
}
