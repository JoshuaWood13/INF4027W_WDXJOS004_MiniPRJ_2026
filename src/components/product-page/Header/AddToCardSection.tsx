"use client";

import CartCounter from "@/components/ui/CartCounter";
import React, { useState, useEffect } from "react";
import AddToCartBtn from "./AddToCartBtn";
import { Product } from "@/types/product.types";
import { useAuth } from "@/lib/auth/AuthContext";
import { addToWishlist, removeFromWishlist } from "@/lib/firestore/users";
import { FiHeart } from "react-icons/fi";
import { showSuccessToast } from "@/components/ui/SuccessToast";

const AddToCardSection = ({ data }: { data: Product }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const { appUser, firebaseUser, refreshAppUser } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    if (appUser?.wishlist) {
      setIsWishlisted(appUser.wishlist.includes(data.id));
    }
  }, [appUser?.wishlist, data.id]);

  async function handleWishlistToggle() {
    if (!firebaseUser || !appUser) return;

    const newWishlistedState = !isWishlisted;
    setIsWishlisted(newWishlistedState);
    setIsTogglingWishlist(true);

    try {
      if (newWishlistedState) {
        await addToWishlist(firebaseUser.uid, data.id);
        showSuccessToast("Added to wishlist!");
      } else {
        await removeFromWishlist(firebaseUser.uid, data.id);
        showSuccessToast("Removed from wishlist");
      }
      refreshAppUser().catch(console.error);
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      setIsWishlisted(!newWishlistedState);
    } finally {
      setIsTogglingWishlist(false);
    }
  }

  return (
    <div className="fixed md:relative w-full bg-white border-t md:border-none border-black/5 bottom-0 left-0 p-4 md:p-0 z-10 flex items-center justify-between sm:justify-start md:justify-center">
      <CartCounter onAdd={setQuantity} onRemove={setQuantity} />
      <AddToCartBtn data={{ ...data, quantity }} isLoggedIn={!!firebaseUser} />
      {firebaseUser && (
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isTogglingWishlist}
          className="bg-white border border-black/10 rounded-full h-11 md:h-[52px] w-11 md:w-[52px] flex items-center justify-center hover:border-black/30 transition-all disabled:opacity-50 flex-shrink-0 ml-3"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FiHeart
            className={`w-5 h-5 md:w-6 md:h-6 transition-all ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-black/60 hover:text-red-500"
            }`}
          />
        </button>
      )}
    </div>
  );
};

export default AddToCardSection;
