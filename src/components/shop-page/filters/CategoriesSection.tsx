"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
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
  const activeCategory = searchParams.get("category") || "";

  const handleCategoryClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategory === value) {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col space-y-0.5 text-black/60">
      {categories.map((category, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => handleCategoryClick(category.value)}
          className={cn(
            "flex items-center justify-between py-2 text-left",
            activeCategory === category.value && "text-black font-medium"
          )}
        >
          {category.title} <MdKeyboardArrowRight />
        </button>
      ))}
    </div>
  );
};

export default CategoriesSection;
