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

const ramOptions = ["8GB", "16GB", "32GB", "64GB"];

/** RAM filter — replaces the old Size filter */
const RamSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRam = searchParams.get("ram") || "";

  const handleRamClick = (ram: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeRam === ram) {
      params.delete("ram");
    } else {
      params.set("ram", ram);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-ram">
      <AccordionItem value="filter-ram" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          RAM
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex items-center flex-wrap gap-2">
            {ramOptions.map((ram, index) => (
              <button
                key={index}
                type="button"
                className={cn([
                  "bg-[#F0F0F0] flex items-center justify-center px-5 py-2.5 text-sm rounded-full",
                  activeRam === ram && "bg-black font-medium text-white",
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
