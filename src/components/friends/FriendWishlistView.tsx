"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { getUserByUid } from "@/lib/firestore/users";
import { getProductsByIds } from "@/lib/firestore/products";
import { formatPrice, calcDiscountedPrice, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { Product } from "@/types/product.types";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch } from "@/lib/hooks/redux";

export type FriendProfile = { uid: string; displayName: string };

export function FriendWishlistView({
  friend,
  onBack,
}: {
  friend: FriendProfile;
  onBack: () => void;
}) {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load friend's wishlist products
  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByUid(friend.uid);
        if (!user || user.wishlist.length === 0) {
          setLoading(false);
          return;
        }
        const prods = await getProductsByIds(user.wishlist);
        setProducts(prods);
      } catch (err) {
        console.error("Failed to load friend wishlist:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [friend.uid]);

  // Add a product from a friend's wishlist to a users cart
  function handleAddToCart(product: Product) {
    const specsSummary = [
      product.specs.processor.split(" ").slice(0, 3).join(" "),
      product.specs.ram,
      product.specs.storage,
    ];
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        srcUrl: product.images?.[0] || PLACEHOLDER_IMAGE,
        price: product.price,
        attributes: specsSummary,
        discount: product.discount,
        quantity: 1,
      }),
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center hover:border-black/40 transition-all"
          title="Back to friends"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-xl md:text-2xl font-bold">
          {friend.displayName}&apos;s Wishlist
        </h3>
      </div>
    
      {loading && (
        <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
          <p className="text-sm text-black/40">Loading wishlist…</p>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
          <p className="text-sm text-black/40">
            {friend.displayName}&apos;s wishlist is empty.
          </p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="space-y-4">
          {products.map((product) => {
            const discountedPrice = calcDiscountedPrice(
              product.price,
              product.discount,
            );
            const hasDiscount =
              product.discount.percentage > 0 || product.discount.amount > 0;
            const imageUrl = product.images?.[0] || PLACEHOLDER_IMAGE;

            return (
              <div
                key={product.id}
                className="rounded-[20px] border border-black/10 p-4 md:p-5 flex items-center gap-4"
              >
                {/* Image */}
                <Link
                  href={`/shop/product/${product.id}/${product.name.split(" ").join("-")}`}
                  className="flex-shrink-0"
                >
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-[#F0F0F0]">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/shop/product/${product.id}/${product.name.split(" ").join("-")}`}
                    className="block hover:underline"
                  >
                    <h4 className="font-semibold text-sm md:text-base text-black truncate mb-1">
                      {product.name}
                    </h4>
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-base md:text-lg text-black">
                      {formatPrice(discountedPrice)}
                    </p>
                    {hasDiscount && (
                      <p className="font-bold text-sm text-black/40 line-through">
                        {formatPrice(product.price)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-black text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium hover:bg-black/80 transition-all whitespace-nowrap flex-shrink-0"
                >
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
