import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { FiSliders } from "react-icons/fi";
import Filters from ".";

// Mobile filters drawer (only visible on small screens)
const MobileFilters = () => {
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-[#F0F0F0] text-black p-1 md:hidden"
          >
            <FiSliders className="text-base mx-auto" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90%]">
          <DrawerTitle className="hidden">filters</DrawerTitle>
          <DrawerDescription className="hidden">filters</DrawerDescription>
          <div className="max-h-[90%] overflow-y-auto w-full px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <Filters />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileFilters;
