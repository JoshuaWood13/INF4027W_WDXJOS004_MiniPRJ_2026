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

// Context to share pending activity across the app
type ActivityContextValue = {
  pendingGifts: Order[];
  setPendingGifts: Dispatch<SetStateAction<Order[]>>;
  loadingGifts: boolean;
};

const ActivityContext = createContext<ActivityContextValue>({
  pendingGifts: [],
  setPendingGifts: () => {},
  loadingGifts: true,
});

// Fetch pending gifts for the logged-in user and provide via context
export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth();
  const [pendingGifts, setPendingGifts] = useState<Order[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setPendingGifts([]);
      setLoadingGifts(false);
      return;
    }
    setLoadingGifts(true);
    getGiftOrdersForRecipient(firebaseUser.uid)
      .then(setPendingGifts)
      .catch(() => setPendingGifts([]))
      .finally(() => setLoadingGifts(false));
  }, [firebaseUser]);

  return (
    <ActivityContext.Provider
      value={{ pendingGifts, setPendingGifts, loadingGifts }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivityContext() {
  return useContext(ActivityContext);
}
