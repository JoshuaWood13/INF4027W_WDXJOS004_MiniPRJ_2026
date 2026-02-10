"use client";

import React from "react";
import CategoriesSection from "@/components/shop-page/filters/CategoriesSection";
import BrandSection from "@/components/shop-page/filters/ColorsSection";
import ScreenSizeSection from "@/components/shop-page/filters/DressStyleSection";
import PriceSection from "@/components/shop-page/filters/PriceSection";
import RamSection from "@/components/shop-page/filters/SizeSection";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Filters = () => {
  const router = useRouter();

  return (
    <>
      <hr className="border-t-black/10" />
      <CategoriesSection />
      <hr className="border-t-black/10" />
      <PriceSection />
      <hr className="border-t-black/10" />
      <BrandSection />
      <hr className="border-t-black/10" />
      <RamSection />
      <hr className="border-t-black/10" />
      <ScreenSizeSection />
      <Button
        type="button"
        className="bg-black w-full rounded-full text-sm font-medium py-4 h-12"
        onClick={() => router.push("/shop")}
      >
        Clear All Filters
      </Button>
    </>
  );
};

export default Filters;
