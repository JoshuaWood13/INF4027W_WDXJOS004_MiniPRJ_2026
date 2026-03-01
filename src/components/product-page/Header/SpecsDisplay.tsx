import React from "react";
import { LaptopSpecs } from "@/types/product.types";
import { FiCpu } from "react-icons/fi";
import { BsMemory } from "react-icons/bs";
import { HiOutlineServerStack } from "react-icons/hi2";
import { MdMonitor } from "react-icons/md";

type SpecsDisplayProps = {
  specs: LaptopSpecs;
};

const specItems = [
  { key: "processor" as const, icon: FiCpu, label: "Processor" },
  { key: "ram" as const, icon: BsMemory, label: "RAM" },
  { key: "storage" as const, icon: HiOutlineServerStack, label: "Storage" },
  { key: "gpu" as const, icon: MdMonitor, label: "GPU" },
];

// Displays key specifications of a laptop
const SpecsDisplay = ({ specs }: SpecsDisplayProps) => {
  return (
    <div className="flex flex-col mb-5">
      <span className="text-sm sm:text-base text-black/60 mb-3">
        Key Specifications
      </span>
      <div className="grid grid-cols-2 gap-2">
        {specItems.map(({ key, icon: Icon, label }) => (
          <div
            key={key}
            className="flex items-center gap-2 bg-[#F0F0F0] rounded-lg px-3 py-2.5"
          >
            <Icon className="text-lg text-black/60 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-black/40 uppercase tracking-wider">
                {label}
              </span>
              <span className="text-xs sm:text-sm font-medium text-black truncate">
                {specs[key]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecsDisplay;
