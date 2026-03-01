"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { mergeCartItems, CartItem } from "@/lib/features/carts/cartsSlice";
import { getUserCart, saveUserCart } from "@/lib/firestore/users";

/**
 * Renderless component that syncs Redux cart with Firestore.
 *
 * - On login: loads user's Firestore cart and merges into local Redux cart.
 * - While logged in: saves Redux cart to Firestore on changes (debounced).
 * - Saves are blocked until the initial Firestore load completes, preventing
 *   the guest cart from overwriting the user's saved cart before merge.
 */
export default function CartSync() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const { cart } = useAppSelector((state: RootState) => state.carts);
  const dispatch = useAppDispatch();

  // Track whether loaded the Firestore cart for the current user
  const loadedUidRef = useRef<string | null>(null);
  // Block saves until the initial Firestore load has completed + merged
  const initialLoadDoneRef = useRef(false);

  // Load from firestore on login
  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      loadedUidRef.current = null;
      initialLoadDoneRef.current = false;
      return;
    }

    // Already loaded for this user
    if (loadedUidRef.current === firebaseUser.uid) return;

    loadedUidRef.current = firebaseUser.uid;
    initialLoadDoneRef.current = false;

    async function loadCart() {
      try {
        const firestoreItems = await getUserCart(firebaseUser!.uid);
        if (firestoreItems.length > 0) {
          dispatch(mergeCartItems(firestoreItems as CartItem[]));
        }
      } catch (err) {
        console.error("Failed to load cart from Firestore:", err);
      } finally {
        // Allow saves only after Firestore load + merge is complete
        initialLoadDoneRef.current = true;
      }
    }

    loadCart();
  }, [authLoading, firebaseUser, dispatch]);

  // Save to firestore on cart changes
  useEffect(() => {
    if (authLoading || !firebaseUser) return;

    // Prevent local guest cart from overwriting saved firestore cart before the merge has happened.
    if (!initialLoadDoneRef.current) return;

    const timeout = setTimeout(() => {
      const items = cart?.items ?? [];
      saveUserCart(
        firebaseUser.uid,
        items as unknown as Record<string, unknown>[]
      ).catch((err) =>
        console.error("Failed to save cart to Firestore:", err)
      );
    }, 1000); // 1s debounce

    return () => clearTimeout(timeout);
  }, [cart, authLoading, firebaseUser]);

  return null; // Renderless
}
