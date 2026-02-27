"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { IoClose } from "react-icons/io5";

// Shows removable tags for each active filter (read form URL search params)
const FilterTags = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pull active filter values from URL search params
  const brands = (searchParams.get("brand") || "").split(",").filter(Boolean);
  const rams = (searchParams.get("ram") || "").split(",").filter(Boolean);
  const screens = (searchParams.get("screen") || "").split(",").filter(Boolean);
  const processors = (searchParams.get("processor") || "")
    .split(",")
    .filter(Boolean);
  const storages = (searchParams.get("storage") || "")
    .split(",")
    .filter(Boolean);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const onSale = searchParams.get("onSale") === "true";
  const featured = searchParams.get("featured") === "true";

  // Remove one value from a multi-select param, or delete the param if is last
  const removeFromParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = (params.get(key) || "").split(",").filter(Boolean);
    const updated = current.filter((v) => v !== value);
    if (updated.length > 0) {
      params.set(key, updated.join(","));
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const removePrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const formatPrice = (val: string | number) =>
    Number(val).toLocaleString("en-ZA");

  // Build an array of tag objects
  const tags: { label: string; onRemove: () => void }[] = [];

  brands.forEach((b) =>
    tags.push({ label: b, onRemove: () => removeFromParam("brand", b) }),
  );
  processors.forEach((p) =>
    tags.push({
      label: p,
      onRemove: () => removeFromParam("processor", p),
    }),
  );
  rams.forEach((r) =>
    tags.push({
      label: r + " RAM",
      onRemove: () => removeFromParam("ram", r),
    }),
  );
  storages.forEach((s) =>
    tags.push({
      label: s + " storage",
      onRemove: () => removeFromParam("storage", s),
    }),
  );
  screens.forEach((s) =>
    tags.push({
      label: `${s}" screen`,
      onRemove: () => removeFromParam("screen", s),
    }),
  );
  if (minPrice || maxPrice) {
    const label = `R${formatPrice(minPrice || "0")} – R${formatPrice(maxPrice || "80000")}`;
    tags.push({ label, onRemove: removePrice });
  }
  if (onSale) {
    tags.push({
      label: "On Sale",
      onRemove: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("onSale");
        router.push(`/shop?${params.toString()}`, { scroll: false });
      },
    });
  }
  if (featured) {
    tags.push({
      label: "Featured",
      onRemove: () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("featured");
        router.push(`/shop?${params.toString()}`, { scroll: false });
      },
    });
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="flex items-center gap-1 bg-black/5 text-black/60 text-xs px-2.5 py-1 rounded-full border border-black/10"
        >
          {tag.label}
          <button
            type="button"
            onClick={tag.onRemove}
            className="hover:text-black ml-0.5"
          >
            <IoClose className="text-xs" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default FilterTags;
