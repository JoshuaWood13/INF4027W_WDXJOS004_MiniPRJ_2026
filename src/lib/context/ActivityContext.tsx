"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getGiftOrdersForRecipient } from "@/lib/firestore/orders";
import { Order } from "@/types/order.types";

// Context for sharing pending activity across the app
type ActivityContextValue = {
  pendingGifts: Order[];
  setPendingGifts: Dispatch<SetStateAction<Order[]>>;
  loadingGifts: boolean;
  refreshGifts: () => Promise<void>;
};

const ActivityContext = createContext<ActivityContextValue>({
  pendingGifts: [],
  setPendingGifts: () => {},
  loadingGifts: true,
  refreshGifts: async () => {},
});

// Fetch pending gifts for the logged-in user and provide via context
export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth();
  const [pendingGifts, setPendingGifts] = useState<Order[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);

  async function refreshGifts() {
    if (!firebaseUser) return;
    setLoadingGifts(true);
    try {
      const gifts = await getGiftOrdersForRecipient(firebaseUser.uid);
      setPendingGifts(gifts);
    } catch {
      setPendingGifts([]);
    } finally {
      setLoadingGifts(false);
    }
  }

  useEffect(() => {
    if (!firebaseUser) {
      setPendingGifts([]);
      setLoadingGifts(false);
      return;
    }
    refreshGifts();
  }, [firebaseUser]);

  return (
    <ActivityContext.Provider
      value={{ pendingGifts, setPendingGifts, loadingGifts, refreshGifts }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivityContext() {
  return useContext(ActivityContext);
}
