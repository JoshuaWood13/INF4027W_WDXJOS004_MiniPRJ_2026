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

const PriceSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMin = Number(searchParams.get("minPrice")) || 5000;
  const initialMax = Number(searchParams.get("maxPrice")) || 50000;

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
    router.push(`/shop?${params.toString()}`);
  }, [priceRange, searchParams, router]);

  return (
    <Accordion type="single" collapsible defaultValue="filter-price">
      <AccordionItem value="filter-price" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Price
        </AccordionTrigger>
        <AccordionContent className="pt-4" contentClassName="overflow-visible">
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
