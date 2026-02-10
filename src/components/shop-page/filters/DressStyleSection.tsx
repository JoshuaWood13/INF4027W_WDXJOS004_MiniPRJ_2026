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

const screenSizes = ['13"', '14"', '15.6"', '16"', '17"'];

/** Screen Size filter — replaces the old Dress Style filter */
const ScreenSizeSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeScreen = searchParams.get("screen") || "";

  const handleScreenClick = (screen: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeScreen === screen) {
      params.delete("screen");
    } else {
      params.set("screen", screen);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-screen">
      <AccordionItem value="filter-screen" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          Screen Size
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-0">
          <div className="flex items-center flex-wrap gap-2">
            {screenSizes.map((size, index) => (
              <button
                key={index}
                type="button"
                className={cn([
                  "bg-[#F0F0F0] flex items-center justify-center px-5 py-2.5 text-sm rounded-full",
                  activeScreen === size && "bg-black font-medium text-white",
                ])}
                onClick={() => handleScreenClick(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ScreenSizeSection;
