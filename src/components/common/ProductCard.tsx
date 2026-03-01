"use client";

import React, { useState, useEffect } from "react";
import Rating from "../ui/Rating";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { formatPrice, calcDiscountedPrice, calcDiscountPercentage, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { addToWishlist, removeFromWishlist } from "@/lib/firestore/users";
import { FiHeart } from "react-icons/fi";
import { showSuccessToast } from "../ui/SuccessToast";

type ProductCardProps = {
  data: Product;
};

const ProductCard = ({ data }: ProductCardProps) => {
  const { appUser, firebaseUser, refreshAppUser } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const imageUrl = data.images?.[0] || PLACEHOLDER_IMAGE;
  const discountedPrice = calcDiscountedPrice(data.price, data.discount);
  const hasDiscount = data.discount.percentage > 0 || data.discount.amount > 0;
  const discountPct = calcDiscountPercentage(data.price, data.discount);

  // Check if product is in wishlist
  useEffect(() => {
    if (appUser?.wishlist) {
      setIsWishlisted(appUser.wishlist.includes(data.id));
    }
  }, [appUser?.wishlist, data.id]);

  async function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!firebaseUser || !appUser) {
      return;
    }

    const newWishlistedState = !isWishlisted;
    setIsWishlisted(newWishlistedState);
    setIsTogglingWishlist(true);

    try {
      if (newWishlistedState) {
        await addToWishlist(firebaseUser.uid, data.id);
        showSuccessToast("Added to wishlist!");
      } else {
        await removeFromWishlist(firebaseUser.uid, data.id);
        showSuccessToast("Removed from wishlist!");
      }
      refreshAppUser().catch(console.error);
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      setIsWishlisted(!newWishlistedState);
    } finally {
      setIsTogglingWishlist(false);
    }
  }

  // Render product card with image, name, key specs, rating, price, and wishlist button (if logged in)
  return (
    <div className="flex flex-col items-start aspect-auto relative group">
      {/* Wishlist button */}
      {firebaseUser && (
        <button
          onClick={handleWishlistToggle}
          disabled={isTogglingWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-all duration-200 disabled:opacity-50"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FiHeart
            className={`w-4 h-4 transition-all ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-black/60 hover:text-red-500"
            }`}
          />
        </button>
      )}

      <Link
        href={`/shop/product/${data.id}/${data.name.split(" ").join("-")}`}
        className="flex flex-col items-start w-full"
      >
        <div className="bg-[#F0EEED] rounded-[13px] lg:rounded-[20px] w-full lg:max-w-[295px] aspect-square mb-2.5 xl:mb-4 overflow-hidden">
          <Image
            src={imageUrl}
            width={295}
            height={298}
            className="rounded-md w-full h-full object-contain hover:scale-110 transition-all duration-500"
            alt={data.name}
            priority
          />
        </div>
        <strong className="text-black xl:text-xl">{data.name}</strong>
        {/* Key specs badges */}
        <div className="flex items-center gap-1.5 mt-1 mb-1 flex-wrap">
          <span className="text-[10px] xl:text-xs bg-black/5 text-black/70 px-2 py-0.5 rounded-full">
            {data.specs.processor.split(" ").slice(0, 3).join(" ")}
          </span>
          <span className="text-[10px] xl:text-xs bg-black/5 text-black/70 px-2 py-0.5 rounded-full">
            {data.specs.ram}
          </span>
        </div>
        <div className="flex items-end mb-1 xl:mb-2">
          <Rating
            initialValue={data.rating}
            allowFraction
            SVGclassName="inline-block"
            emptyClassName="fill-gray-50"
            size={19}
            readonly
          />
          <span className="text-black text-xs xl:text-sm ml-[11px] xl:ml-[13px] pb-0.5 xl:pb-0">
            {data.rating.toFixed(1)}
            <span className="text-black/60">/5</span>
          </span>
        </div>
        <div className="flex items-center space-x-[5px] xl:space-x-2.5">
          <span className="font-bold text-black text-xl xl:text-2xl">
            {formatPrice(discountedPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="font-bold text-black/40 line-through text-xl xl:text-2xl">
                {formatPrice(data.price)}
              </span>
              <span className="font-medium text-[10px] xl:text-xs py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                {`-${discountPct}%`}
              </span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
