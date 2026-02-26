"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getProductsByIds } from "@/lib/firestore/products";
import { removeFromWishlist, removePriceWatcher } from "@/lib/firestore/users";
import { Product } from "@/types/product.types";
import { PriceWatcher } from "@/types/user.types";
import { addToCart } from "@/lib/features/carts/cartsSlice";
import { useAppDispatch } from "@/lib/hooks/redux";
import Image from "next/image";
import Link from "next/link";
import { FiTrash2, FiEye, FiX } from "react-icons/fi";
import { formatPrice, calcDiscountedPrice, calcDiscountPercentage, PLACEHOLDER_IMAGE } from "@/lib/utils";
import WatcherModal from "@/components/wishlist/WatcherModal";
import { showSuccessToast } from "@/components/ui/SuccessToast";

export default function WishlistPage() {
  const { appUser, firebaseUser, refreshAppUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removingWatcherId, setRemovingWatcherId] = useState<string | null>(null);
  const [watcherModalProductId, setWatcherModalProductId] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Fetch wishlist products
  useEffect(() => {
    async function fetchWishlistProducts() {
      if (!appUser || !appUser.wishlist.length) {
        setLoading(false);
        return;
      }

      try {
        const wishlistProducts = await getProductsByIds(appUser.wishlist);
        setProducts(wishlistProducts);
      } catch (error) {
        console.error("Failed to fetch wishlist products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlistProducts();
  }, [appUser]);

  async function handleRemoveFromWishlist(productId: string) {
    if (!firebaseUser) return;

    setRemovingId(productId);
    try {
      await removeFromWishlist(firebaseUser.uid, productId);
      await refreshAppUser();
      showSuccessToast("Removed from wishlist!");
      // Remove from local state
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    } finally {
      setRemovingId(null);
    }
  }

  async function handleRemoveWatcher(watcher: PriceWatcher) {
    if (!firebaseUser) return;
    setRemovingWatcherId(watcher.productId);
    try {
      await removePriceWatcher(firebaseUser.uid, watcher);
      await refreshAppUser();
      showSuccessToast("Price watcher removed!");
    } catch (error) {
      console.error("Failed to remove watcher:", error);
    } finally {
      setRemovingWatcherId(null);
    }
  }

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
    showSuccessToast("Added to cart!");
  }

  const modalProduct = watcherModalProductId
    ? (products.find((p) => p.id === watcherModalProductId) ?? null)
    : null;

  if (loading) {
    return (
      <div>
        <h3 className="text-xl md:text-2xl font-bold mb-6">Wishlist</h3>
        <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
          <p className="text-sm text-black/40">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <h3 className="text-xl md:text-2xl font-bold mb-6">Wishlist</h3>
        <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
          <p className="text-sm text-black/40">
            Your wishlist is empty. Start adding products you love!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <h3 className="text-xl md:text-2xl font-bold mb-6">
          Wishlist ({products.length})
        </h3>
        <div className="space-y-4">
          {products.map((product) => {
            const discountedPrice = calcDiscountedPrice(
              product.price,
              product.discount,
            );
            const hasDiscount =
              product.discount.percentage > 0 || product.discount.amount > 0;
            const discountPct = calcDiscountPercentage(
              product.price,
              product.discount,
            );
            const imageUrl = product.images?.[0] || PLACEHOLDER_IMAGE;

            // Find active watcher for product
            const activeWatcher =
              appUser?.priceWatchers.find((w) => w.productId === product.id) ??
              null;

            return (
              <div
                key={product.id}
                className="rounded-[20px] border border-black/10 p-4 md:p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-4">
                  {/* Product Image */}
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

                  {/* Product Info */}
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
                        <>
                          <p className="font-bold text-sm md:text-base text-black/40 line-through">
                            {formatPrice(product.price)}
                          </p>
                          <span className="font-medium text-[10px] md:text-xs py-1 px-2.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                            -{discountPct}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Primary action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="bg-black text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium hover:bg-black/80 transition-all whitespace-nowrap"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      disabled={removingId === product.id}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-black/10 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-50"
                      aria-label="Remove from wishlist"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Watcher row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {activeWatcher ? (
                    // Active watcher indicator
                    <div className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-black/70">
                      <FiEye className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Watching: {formatPrice(activeWatcher.targetPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setWatcherModalProductId(product.id)}
                        className="underline text-black/50 hover:text-black transition-colors ml-1"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveWatcher(activeWatcher)}
                        disabled={removingWatcherId === product.id}
                        className="ml-0.5 hover:text-red-500 transition-colors disabled:opacity-50"
                        aria-label="Remove price watcher"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    // Watch Price button
                    <button
                      type="button"
                      onClick={() => setWatcherModalProductId(product.id)}
                      className="flex items-center gap-1.5 border border-black/10 rounded-full px-3 py-1.5 text-xs font-medium text-black/60 hover:border-black/30 hover:text-black transition-all"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                      Watch Price
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Watcher modal */}
      {modalProduct && appUser && firebaseUser && (
        <WatcherModal
          product={modalProduct}
          existingWatcher={
            appUser.priceWatchers.find(
              (w) => w.productId === modalProduct.id,
            ) ?? null
          }
          userUid={firebaseUser.uid}
          savedAddresses={appUser.addresses}
          onClose={() => setWatcherModalProductId(null)}
          onSaved={async () => {
            setWatcherModalProductId(null);
            await refreshAppUser();
          }}
        />
      )}
    </>
  );
}
