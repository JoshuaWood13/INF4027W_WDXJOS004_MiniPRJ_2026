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

const processors = ["Intel", "AMD", "Apple"];

const ProcessorSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeProcessors = (searchParams.get("processor") || "")
    .split(",")
    .filter(Boolean);

  const handleClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = [...activeProcessors];
    const idx = current.indexOf(value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(value);
    }
    if (current.length > 0) {
      params.set("processor", current.join(","));
    } else {
      params.delete("processor");
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("processor");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <Accordion type="single" collapsible defaultValue="filter-processor">
      <AccordionItem value="filter-processor" className="border-none">
        <AccordionTrigger className="text-black font-bold text-xl hover:no-underline p-0 py-0.5">
          <span className="flex-1 flex items-center">
            Processor
            {activeProcessors.length > 0 && (
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
            {processors.map((proc, index) => (
              <button
                key={index}
                type="button"
                className={cn([
                  "bg-[#F0F0F0] flex items-center justify-center px-4 py-2 text-sm rounded-full",
                  activeProcessors.includes(proc) &&
                    "bg-black font-medium text-white",
                ])}
                onClick={() => handleClick(proc)}
              >
                {proc}
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProcessorSection;
