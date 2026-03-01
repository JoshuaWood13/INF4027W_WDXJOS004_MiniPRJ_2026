"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { IoCheckmark } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { MdKeyboardArrowRight } from "react-icons/md";

const statuses = [
  { title: "On Sale", param: "onSale" },
  { title: "Featured", param: "featured" },
];

// Status filter (On Sale, Featured)
const StatusSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeStatuses = statuses
    .filter((s) => searchParams.get(s.param) === "true")
    .map((s) => s.param);

  const handleToggle = (param: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(param) === "true") {
      params.delete(param);
    } else {
      params.set(param, "true");
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    statuses.forEach((s) => params.delete(s.param));
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      <div className="flex items-center justify-between py-1">
        <span className="font-bold text-black text-xl">Status</span>
        {activeStatuses.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-black/40 hover:text-black underline"
          >
            Clear
          </button>
        )}
      </div>
      {statuses.map((status) => {
        const isActive = activeStatuses.includes(status.param);
        return (
          <button
            key={status.param}
            type="button"
            onClick={() => handleToggle(status.param)}
            className={cn(
              "flex items-center justify-between py-2 text-left",
              isActive && "text-black font-medium",
            )}
          >
            <span className="flex items-center gap-2">
              {isActive && <IoCheckmark className="text-sm" />}
              {status.title}
            </span>
            <MdKeyboardArrowRight />
          </button>
        );
      })}
    </div>
  );
};

export default StatusSection;
