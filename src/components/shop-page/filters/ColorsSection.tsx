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

const brands = ["Dell", "Lenovo", "HP", "ASUS", "Apple"];

/** Brand filter — replaces the old Colors filter */
const BrandSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeBrand = searchParams.get("brand") || "";

  const handleBrandClick = (brand: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeBrand === brand) {
      params.delete("brand");
    } else {
      params.set("brand", brand);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-brand">
      <AccordionItem value="filter-brand" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Brand
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex items-center flex-wrap gap-2">
            {brands.map((brand, index) => (
              <button
                key={index}
                type="button"
                className={cn([
                  "bg-[#F0F0F0] flex items-center justify-center px-4 py-2 text-sm rounded-full",
                  activeBrand === brand && "bg-black font-medium text-white",
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
