import React from "react";
import { Product } from "@/types/product.types";

const DescriptionContent = ({ product }: { product: Product }) => {
  return (
    <section>
      <h3 className="text-xl sm:text-2xl font-bold text-black mb-5 sm:mb-6">
        Product Description
      </h3>
      <p className="text-sm sm:text-base text-black/80 leading-7 mb-6">
        {product.description}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#F0F0F0] rounded-xl p-4">
          <h4 className="font-medium text-sm text-black mb-2">Highlights</h4>
          <ul className="text-sm text-black/70 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-black/40 mt-0.5">•</span>
              {product.specs.processor}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black/40 mt-0.5">•</span>
              {product.specs.ram} Memory
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black/40 mt-0.5">•</span>
              {product.specs.storage} Storage
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black/40 mt-0.5">•</span>
              {product.specs.screenSize} {product.specs.display}
            </li>
          </ul>
        </div>
        <div className="bg-[#F0F0F0] rounded-xl p-4">
          <h4 className="font-medium text-sm text-black mb-2">
            What&apos;s Included
          </h4>
          <ul className="text-sm text-black/70 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-black/40 mt-0.5">•</span>
              {product.name}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black/40 mt-0.5">•</span>
              Power adapter and cable
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black/40 mt-0.5">•</span>
              Quick start guide
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black/40 mt-0.5">•</span>
              Warranty documentation
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default DescriptionContent;
