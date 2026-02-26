"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const brands = ["Dell", "Lenovo", "HP", "ASUS", "Apple", "MSI", "Acer"];

/** Brand filter — replaces the old Colors filter */
const BrandSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeBrands = (searchParams.get("brand") || "")
    .split(",")
    .filter(Boolean);

  const handleBrandClick = (brand: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = [...activeBrands];
    const idx = current.indexOf(brand);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(brand);
    }
    if (current.length > 0) {
      params.set("brand", current.join(","));
    } else {
      params.delete("brand");
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("brand");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-brand">
      <AccordionItem value="filter-brand" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          <span className="flex-1 flex items-center">
            Brand
            {activeBrands.length > 0 && (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleClear();
                }}
                className="ml-auto mr-2 text-xs font-normal text-black/40 hover:text-black underline"
              >
                Clear
              </span>
            )}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex items-center flex-wrap gap-2">
            {brands.map((brand, index) => (
              <button
                key={index}
                type="button"
                className={cn([
                  "bg-[#F0F0F0] flex items-center justify-center px-4 py-2 text-sm rounded-full",
                  activeBrands.includes(brand) &&
                    "bg-black font-medium text-white",
                ])}
                onClick={() => handleBrandClick(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default BrandSection;
