import React from "react";
import { Product } from "@/types/product.types";

type SpecItem = {
  label: string;
  value: string;
};

const ProductDetailsContent = ({ product }: { product: Product }) => {
  const specsData: SpecItem[] = [
    { label: "Processor", value: product.specs.processor },
    { label: "RAM", value: product.specs.ram },
    { label: "Storage", value: product.specs.storage },
    { label: "Graphics", value: product.specs.gpu },
    { label: "Screen Size", value: product.specs.screenSize },
    { label: "Display", value: product.specs.display },
    { label: "Operating System", value: product.specs.os },
    { label: "Weight", value: product.specs.weight },
    { label: "Brand", value: product.brand },
    { label: "Category", value: product.category.charAt(0).toUpperCase() + product.category.slice(1) },
  ];

  return (
    <section>
      <h3 className="text-xl sm:text-2xl font-bold text-black mb-5 sm:mb-6">
        Technical Specifications
      </h3>
      {specsData.map((item, i) => (
        <div className="grid grid-cols-3" key={i}>
          <div>
            <p className="text-sm py-3 w-full leading-7 lg:py-4 pr-2 text-neutral-500">
              {item.label}
            </p>
          </div>
          <div className="col-span-2 py-3 lg:py-4 border-b">
            <p className="text-sm w-full leading-7 text-neutral-800 font-medium">
              {item.value}
            </p>
          </div>
        </div>
      ))}
      {product.tags && product.tags.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-neutral-500 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-black/5 text-black/70 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetailsContent;
