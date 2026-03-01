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

const ramOptions = ["8GB", "16GB", "18GB", "32GB", "48GB", "64GB"];

// RAM filter
const RamSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRams = (searchParams.get("ram") || "").split(",").filter(Boolean);

  const handleRamClick = (ram: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = [...activeRams];
    const idx = current.indexOf(ram);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(ram);
    }
    if (current.length > 0) {
      params.set("ram", current.join(","));
    } else {
      params.delete("ram");
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("ram");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-ram">
      <AccordionItem value="filter-ram" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          <span className="flex-1 flex items-center">
            RAM
            {activeRams.length > 0 && (
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
            {ramOptions.map((ram, index) => (
              <button
                key={index}
                type="button"
                className={cn([
                  "bg-[#F0F0F0] flex items-center justify-center px-5 py-2.5 text-sm rounded-full",
                  activeRams.includes(ram) && "bg-black font-medium text-white",
                ])}
                onClick={() => handleRamClick(ram)}
              >
                {ram}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RamSection;
