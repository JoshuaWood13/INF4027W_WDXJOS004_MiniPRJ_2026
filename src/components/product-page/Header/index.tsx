import React from "react";
import PhotoSection from "./PhotoSection";
import { Product } from "@/types/product.types";
import { integralCF } from "@/styles/fonts";
import { cn, formatPrice, calcDiscountedPrice, calcDiscountPercentage } from "@/lib/utils";
import Rating from "@/components/ui/Rating";
import SpecsDisplay from "./SpecsDisplay";
import AddToCardSection from "./AddToCardSection";

// Product details header section
const Header = ({ data }: { data: Product }) => {
  const discountedPrice = calcDiscountedPrice(data.price, data.discount);
  const hasDiscount = data.discount.percentage > 0 || data.discount.amount > 0;
  const discountPct = calcDiscountPercentage(data.price, data.discount);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <PhotoSection data={data} />
        </div>
        <div>
          <h1
            className={cn([
              integralCF.className,
              "text-2xl md:text-[40px] md:leading-[40px] mb-3 md:mb-3.5 capitalize",
            ])}
          >
            {data.name}
          </h1>
          <div className="flex items-center mb-3 sm:mb-3.5">
            <Rating
              initialValue={data.rating}
              allowFraction
              SVGclassName="inline-block"
              emptyClassName="fill-gray-50"
              size={25}
              readonly
            />
            <span className="text-black text-xs sm:text-sm ml-[11px] sm:ml-[13px] pb-0.5 sm:pb-0">
              {data.rating.toFixed(1)}
              <span className="text-black/60">/5</span>
            </span>
          </div>
          <div className="flex items-center space-x-2.5 sm:space-x-3 mb-5">
            <span className="font-bold text-black text-2xl sm:text-[32px]">
              {formatPrice(discountedPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="font-bold text-black/40 line-through text-2xl sm:text-[32px]">
                  {formatPrice(data.price)}
                </span>
                <span className="font-medium text-[10px] sm:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                  {`-${discountPct}%`}
                </span>
              </>
            )}
          </div>
          <p className="text-sm sm:text-base text-black/60 mb-5">
            {data.description}
          </p>
          <hr className="h-[1px] border-t-black/10 mb-5" />
          <SpecsDisplay specs={data.specs} />
          <hr className="hidden md:block h-[1px] border-t-black/10 my-5" />
          <AddToCardSection data={data} />
        </div>
      </div>
    </>
  );
};

export default Header;
