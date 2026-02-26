"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useActivityContext } from "@/lib/context/ActivityContext";
import { acceptFriendRequest, declineFriendRequest, removeAutoBuyMessage } from "@/lib/firestore/users";
import { updateOrderStatus, updateOrder } from "@/lib/firestore/orders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Order } from "@/types/order.types";
import Image from "next/image";
import { FiCheck, FiShoppingBag, FiUserPlus } from "react-icons/fi";
import Link from "next/link";
import { formatPrice, PLACEHOLDER_IMAGE, cn } from "@/lib/utils";
import { showSuccessToast } from "../ui/SuccessToast";

export default function ActivitySection() {
  const { appUser, firebaseUser, refreshAppUser } = useAuth();
  const { pendingGifts, setPendingGifts, loadingGifts } = useActivityContext();

  const [dismissingId, setDismissingId] = useState<string | null>(null);
  // Remove from view immediately on dismiss
  const [hiddenAutoBuyIds, setHiddenAutoBuyIds] = useState<Set<string>>(new Set());

  // Gift acceptance modal
  const [acceptingGift, setAcceptingGift] = useState<Order | null>(null);
  const [acceptAddressId, setAcceptAddressId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  // Auto-buy messages sorted by new
  const autoBuyMessages = [...(appUser?.autoBuyMessages ?? [])]
    .filter((m) => !hiddenAutoBuyIds.has(m.id))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const incomingRequests = appUser?.incomingRequests ?? [];

  async function handleDismissAutoBuy(msgId: string) {
    if (!firebaseUser) return;
    // Immediately hide from view
    setHiddenAutoBuyIds((prev) => new Set(prev).add(msgId));
    setDismissingId(msgId);
    try {
      // Remove from firestore
      await removeAutoBuyMessage(firebaseUser.uid, msgId);
      await refreshAppUser();
    } catch (err) {
      console.error("Failed to remove auto-buy message:", err);
      // Restore on failure
      setHiddenAutoBuyIds((prev) => {
        const next = new Set(prev);
        next.delete(msgId);
        return next;
      });
    } finally {
      setDismissingId(null);
    }
  }


  // Accept friend request
  async function handleAcceptRequest(fromUid: string) {
    if (!firebaseUser) return;
    await acceptFriendRequest(firebaseUser.uid, fromUid);
    await refreshAppUser();
    showSuccessToast("Friend request accepted!");
  }

  // Decline freind request
  async function handleDeclineRequest(fromUid: string) {
    if (!firebaseUser) return;
    await declineFriendRequest(firebaseUser.uid, fromUid);
    await refreshAppUser();
    showSuccessToast("Friend request declined!");
  }

  // Open gift acceptance modal
  function handleOpenGiftAccept(order: Order) {
    setAcceptingGift(order);
    setAcceptAddressId(null);
  }

  // Confirm gift acceptance with selected address
  async function handleConfirmAcceptGift() {
    if (!acceptingGift || !acceptAddressId) return;
    const addr = appUser?.addresses.find((a) => a.id === acceptAddressId);
    if (!addr) return;
    setAccepting(true);
    try {
      const { id: _id, addressType: _type, ...shippingAddress } = addr;
      await updateOrder(acceptingGift.id, { shippingAddress });
      await updateOrderStatus(acceptingGift.id, "complete");
      setPendingGifts((prev) => prev.filter((o) => o.id !== acceptingGift.id));
      setAcceptingGift(null);
    } finally {
      setAccepting(false);
      showSuccessToast("Gift accepted!");
    }
  }

  // Decline gift
  async function handleDeclineGift(orderId: string) {
    await updateOrderStatus(orderId, "refunded");
    setPendingGifts((prev) => prev.filter((o) => o.id !== orderId));
    showSuccessToast("Gift declined!");
  }

  // Format relative time for auto-buy messages
  function formatRelativeTime(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const hasActivity =
    incomingRequests.length > 0 ||
    pendingGifts.length > 0 ||
    autoBuyMessages.length > 0;

  return (
    <>
      <div className="mb-8">
        <h3 className="text-xl md:text-2xl font-bold mb-4">Activity</h3>

        {loadingGifts ? (
          <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
            <p className="text-sm text-black/40">Loading activity...</p>
          </div>
        ) : !hasActivity ? (
          <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
            <p className="text-sm text-black/40">No recent activity.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Incoming friend requests */}
            {incomingRequests.map((req) => (
              <div
                key={req.fromUid}
                className="rounded-[20px] border border-black/10 p-4 md:p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                  <FiUserPlus className="text-black/50 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm md:text-base text-black truncate">
                    {req.fromDisplayName}
                  </p>
                  <p className="text-xs text-black/40">
                    Sent you a friend request
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAcceptRequest(req.fromUid)}
                    className="bg-black text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-black/80 transition-all"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req.fromUid)}
                    className="border border-black/20 text-black/60 px-4 py-2 rounded-full text-xs font-medium hover:border-black/40 hover:text-black transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}

            {/* Pending gift orders */}
            {pendingGifts.map((order) => (
              <div
                key={order.id}
                className="rounded-[20px] border border-black/10 p-4 md:p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex -space-x-2 flex-shrink-0">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.productId}
                        className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F0F0F0] border-2 border-white"
                      >
                        <Image
                          src={item.image || PLACEHOLDER_IMAGE}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm md:text-base text-black">
                      {order.senderDisplayName || "Someone"} sent you a gift!
                    </p>
                    <p className="text-xs text-black/40 mt-0.5">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""} ·{" "}
                      {formatPrice(order.totalAmount)}
                    </p>
                    {order.giftMessage && (
                      <p className="text-xs text-black/60 mt-1.5 italic">
                        &ldquo;{order.giftMessage}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 self-start">
                    <button
                      onClick={() => handleOpenGiftAccept(order)}
                      className="bg-black text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-black/80 transition-all"
                    >
                      Accept
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="border border-black/20 text-black/60 px-4 py-2 rounded-full text-xs font-medium hover:border-red-400 hover:text-red-500 transition-all">
                          Decline
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Decline Gift?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to decline this gift from{" "}
                            <span className="font-semibold text-black">
                              {order.senderDisplayName || "Someone"}
                            </span>
                            ? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeclineGift(order.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Decline Gift
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}

            {/* Auto-buy messages */}
            {autoBuyMessages.length > 0 && (
              <div className="rounded-[20px] border border-black/10 divide-y divide-black/5">
                {autoBuyMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-4 p-4 md:p-5"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-black/5 flex items-center justify-center">
                      <FiShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black">
                        Auto-purchased:{" "}
                        <span className="font-semibold">{msg.productName}</span>
                      </p>
                      <p className="text-sm text-black/60 mt-0.5">
                        {formatPrice(msg.pricePaid)} · Your watcher triggered
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Link
                          href="/account/orders"
                          className="text-xs text-black/50 underline hover:text-black transition-colors"
                        >
                          View order
                        </Link>
                        <span className="text-xs text-black/30">
                          {formatRelativeTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDismissAutoBuy(msg.id)}
                      disabled={dismissingId === msg.id}
                      className="flex-shrink-0 w-8 h-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-50"
                      aria-label="Dismiss"
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gift acceptance address modal */}
      <Dialog
        open={!!acceptingGift}
        onOpenChange={(open) => !open && setAcceptingGift(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Accept Gift</DialogTitle>
          </DialogHeader>
          {(appUser?.addresses ?? []).length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-black/60 mb-3">
                You need a saved address before you can accept a gift.
              </p>
              <a
                href="/account/addresses"
                className="text-sm font-medium underline hover:text-black/60"
              >
                Add an address &rarr;
              </a>
            </div>
          ) : (
            <>
              <p className="text-sm text-black/60 mb-3">
                Select the address where you&apos;d like your gift delivered.
              </p>
              <div className="space-y-2">
                {(appUser?.addresses ?? []).map((addr) => (
                  <label
                    key={addr.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors",
                      acceptAddressId === addr.id
                        ? "border-black bg-black/5"
                        : "border-black/10 hover:border-black/30",
                    )}
                  >
                    <input
                      type="radio"
                      name="acceptAddress"
                      value={addr.id}
                      checked={acceptAddressId === addr.id}
                      onChange={() => setAcceptAddressId(addr.id)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="text-sm leading-snug">
                      <p className="font-medium text-black">
                        {addr.addressType}
                      </p>
                      <p className="text-black/60">{addr.street}</p>
                      <p className="text-black/60">
                        {addr.suburb && addr.suburb + ", "}
                        {addr.city}, {addr.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <DialogFooter className="mt-4">
                <button
                  type="button"
                  onClick={() => setAcceptingGift(null)}
                  className="flex-1 border border-black/10 text-black rounded-full py-2.5 px-4 text-sm font-medium hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAcceptGift}
                  disabled={!acceptAddressId || accepting}
                  className="flex-1 bg-black text-white rounded-full py-2.5 px-4 text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-40"
                >
                  {accepting ? "Accepting…" : "Confirm"}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
