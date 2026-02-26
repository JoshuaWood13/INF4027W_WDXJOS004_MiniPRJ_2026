"use client";

import React from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import BrandSection from "@/components/shop-page/filters/BrandSection";
import ScreenSizeSection from "@/components/shop-page/filters/ScreenSizeSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import RamSection from "@/components/shop-page/filters/RamSection";
import ProcessorSection from "@/components/shop-page/filters/ProcessorSection";
import StorageSection from "@/components/shop-page/filters/StorageSection";
import { FiSliders } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";

const Filters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasAnyFilter =
    searchParams.has("category") ||
    searchParams.has("brand") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice") ||
    searchParams.has("ram") ||
    searchParams.has("screen") ||
    searchParams.has("processor") ||
    searchParams.has("storage");

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    [
      "category",
      "brand",
      "minPrice",
      "maxPrice",
      "ram",
      "screen",
      "processor",
      "storage",
    ].forEach((k) => params.delete(k));
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="font-bold text-black text-xl">Filters</span>
        <div className="flex items-center gap-2">
          {hasAnyFilter && (
            <button
              type="button"
              className="text-xs bg-black text-white rounded-full px-3 py-1 hover:bg-black/80 transition-colors"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          )}
          <FiSliders className="text-2xl text-black/40" />
        </div>
      </div>
      <hr className="border-t-black/10" />
      <CategoriesSection />
      <hr className="border-t-black/10" />
      <PriceSection />
      <hr className="border-t-black/10" />
      <BrandSection />
      <hr className="border-t-black/10" />
      <ProcessorSection />
      <hr className="border-t-black/10" />
      <RamSection />
      <hr className="border-t-black/10" />
      <StorageSection />
      <hr className="border-t-black/10" />
      <ScreenSizeSection />
    </>
  );
};

export default Filters;
