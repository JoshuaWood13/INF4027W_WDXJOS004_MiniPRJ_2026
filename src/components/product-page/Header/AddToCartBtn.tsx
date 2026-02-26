"use client";

import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch } from "@/lib/hooks/redux";
import { Product } from "@/types/product.types";
import { PLACEHOLDER_IMAGE } from "@/lib/utils";
import React from "react";
import { showSuccessToast } from "@/components/ui/SuccessToast";

const AddToCartBtn = ({
  data,
  isLoggedIn = false,
}: {
  data: Product & { quantity: number };
  isLoggedIn?: boolean;
}) => {
  const dispatch = useAppDispatch();

  // Build specs summary for cart display
  const specsSummary = [
    data.specs.processor.split(" ").slice(0, 3).join(" "),
    data.specs.ram,
    data.specs.storage,
  ];

  return (
    <button
      type="button"
      className={`bg-black ${isLoggedIn ? "flex-1" : "w-full"} ml-3 sm:ml-5 rounded-full h-11 md:h-[52px] text-sm sm:text-base text-white hover:bg-black/80 transition-all`}
      onClick={() => {
        dispatch(
          addToCart({
            id: data.id,
            name: data.name,
            srcUrl: data.images?.[0] || PLACEHOLDER_IMAGE,
            price: data.price,
            attributes: specsSummary,
            discount: data.discount,
            quantity: data.quantity,
          }),
        );
        showSuccessToast("Added to cart!");
      }}
    >
      Add to Cart
    </button>
  );
};

export default AddToCartBtn;
