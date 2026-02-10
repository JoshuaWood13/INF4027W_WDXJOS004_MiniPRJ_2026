"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

type ShopSortSelectProps = {
  currentSort?: string;
};

const ShopSortSelect = ({ currentSort }: ShopSortSelectProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex items-center">
      Sort by:{" "}
      <Select
        defaultValue={currentSort || "newest"}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="sales">Most Popular</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ShopSortSelect;
