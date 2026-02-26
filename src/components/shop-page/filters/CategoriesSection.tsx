"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoCheckmark } from "react-icons/io5";
import { cn } from "@/lib/utils";

const categories = [
  { title: "Gaming", value: "gaming" },
  { title: "Business", value: "business" },
  { title: "Ultrabook", value: "ultrabook" },
  { title: "Student", value: "student" },
  { title: "Workstation", value: "workstation" },
];

const CategoriesSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategories = (searchParams.get("category") || "")
    .split(",")
    .filter(Boolean);

  const handleCategoryClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = [...activeCategories];
    const idx = current.indexOf(value);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(value);
    }
    if (current.length > 0) {
      params.set("category", current.join(","));
    } else {
      params.delete("category");
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      <div className="flex items-center justify-between py-1">
        <span className="font-bold text-black text-xl">Category</span>
        {activeCategories.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-black/40 hover:text-black underline"
          >
            Clear
          </button>
        )}
      </div>
      {categories.map((category, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => handleCategoryClick(category.value)}
          className={cn(
            "flex items-center justify-between py-2 text-left",
            activeCategories.includes(category.value) &&
              "text-black font-medium",
          )}
        >
          <span className="flex items-center gap-2">
            {activeCategories.includes(category.value) && (
              <IoCheckmark className="text-sm" />
            )}
            {category.title}
          </span>
          <MdKeyboardArrowRight />
        </button>
      ))}
    </div>
  );
};

export default CategoriesSection;
