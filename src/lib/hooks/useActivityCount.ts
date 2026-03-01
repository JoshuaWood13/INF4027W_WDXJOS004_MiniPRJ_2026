import { useAuth } from "@/lib/auth/AuthContext";
import { useActivityContext } from "@/lib/context/ActivityContext";
import type { Dispatch, SetStateAction } from "react";
import type { Order } from "@/types/order.types";

export type ActivityCountResult = {
  count: number;
  pendingGifts: Order[];
  setPendingGifts: Dispatch<SetStateAction<Order[]>>;
  loadingGifts: boolean;
};

// Returns activity badge count from friend requests, auto-buy messages, and pending gifts
export function useActivityCount(): ActivityCountResult {
  const { appUser } = useAuth();
  const { pendingGifts, setPendingGifts, loadingGifts } = useActivityContext();

  const friendRequestCount = appUser?.incomingRequests.length ?? 0;
  const autoBuyCount = appUser?.autoBuyMessages.length ?? 0;
  const count = friendRequestCount + autoBuyCount + pendingGifts.length;

  return { count, pendingGifts, setPendingGifts, loadingGifts };
}
