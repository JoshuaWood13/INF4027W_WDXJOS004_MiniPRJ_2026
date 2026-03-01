"use client";

import React, { useState, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

const MIN_PRICE = 0;
const MAX_PRICE = 80000;

// Price filter
const PriceSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isPriceFiltered =
    searchParams.has("minPrice") || searchParams.has("maxPrice");
  const initialMin = isPriceFiltered
    ? Number(searchParams.get("minPrice")) || MIN_PRICE
    : MIN_PRICE;
  const initialMax = isPriceFiltered
    ? Number(searchParams.get("maxPrice")) || MAX_PRICE
    : MAX_PRICE;

  const [priceRange, setPriceRange] = useState<number[]>([
    initialMin,
    initialMax,
  ]);

  const handleApplyPrice = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceRange[0] > MIN_PRICE) {
      params.set("minPrice", priceRange[0].toString());
    } else {
      params.delete("minPrice");
    }
    if (priceRange[1] < MAX_PRICE) {
      params.set("maxPrice", priceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  }, [priceRange, searchParams, router]);

  const handleClear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    router.push(`/shop?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          <span className="flex-1 flex items-center gap-2">
            Price
            {isPriceFiltered && (
              <span className="w-2 h-2 rounded-full bg-black" />
            )}
            {isPriceFiltered && (
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
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
          {isPriceFiltered && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-black/60">
                R{initialMin.toLocaleString("en-ZA")} – R
                {initialMax.toLocaleString("en-ZA")}
              </span>
            </div>
          )}
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={1000}
            label="R "
          />
          <Button
            type="button"
            onClick={handleApplyPrice}
            className="bg-black w-full rounded-full text-xs font-medium py-2 h-8 mt-2"
          >
            Apply Price
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default PriceSection;
