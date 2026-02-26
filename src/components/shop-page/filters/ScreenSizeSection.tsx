"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const screenSizes = [
  { label: '13"', value: "13" },
  { label: '14"', value: "14" },
  { label: '15"', value: "15" },
  { label: '16"', value: "16" },
  { label: '17"', value: "17" },
];

const ScreenSizeSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeScreens = (searchParams.get("screen") || "")
    .split(",")
    .filter(Boolean);

  const handleScreenClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = [...activeScreens];
    const idx = current.indexOf(value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(value);
    }
    if (current.length > 0) {
      params.set("screen", current.join(","));
    } else {
      params.delete("screen");
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("screen");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-screen">
      <AccordionItem value="filter-screen" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          <span className="flex-1 flex items-center">
            Screen Size
            {activeScreens.length > 0 && (
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
            {screenSizes.map((size, index) => (
              <button
                key={index}
                type="button"
                className={cn([
                  "bg-[#F0F0F0] flex items-center justify-center px-5 py-2.5 text-sm rounded-full",
                  activeScreens.includes(size.value) &&
                    "bg-black font-medium text-white",
                ])}
                onClick={() => handleScreenClick(size.value)}
              >
                {size.label}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ScreenSizeSection;
