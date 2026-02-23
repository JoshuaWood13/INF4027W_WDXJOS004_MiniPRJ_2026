"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  updateUser,
  removeFriend,
  getFriendProfiles,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from "@/lib/firestore/users";
import {
  getGiftOrdersForRecipient,
  updateOrderStatus,
  updateOrder,
} from "@/lib/firestore/orders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  generateFriendCode,
  formatPrice,
  PLACEHOLDER_IMAGE,
  cn,
} from "@/lib/utils";
import { Order } from "@/types/order.types";
import Image from "next/image";
import {
  FiCopy,
  FiCheck,
  FiUsers,
  FiEye,
  FiTrash2,
  FiUserPlus,
} from "react-icons/fi";
import {
  FriendWishlistView,
  FriendProfile,
} from "@/components/friends/FriendWishlistView";
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

export default function FriendsPage() {
  const { appUser, firebaseUser, refreshAppUser } = useAuth();

  // State
  const [viewingFriend, setViewingFriend] = useState<FriendProfile | null>(
    null,
  );
  const [friendProfiles, setFriendProfiles] = useState<FriendProfile[]>([]);
  const [pendingGifts, setPendingGifts] = useState<Order[]>([]);
  const [codeCopied, setCodeCopied] = useState(false);
  const [requestInput, setRequestInput] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Gift acceptance modal state
  const [acceptingGift, setAcceptingGift] = useState<Order | null>(null);
  const [acceptAddressId, setAcceptAddressId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  // Load activity and friends
  const loadData = useCallback(async () => {
    if (!firebaseUser) return;

    // Repair missing friend code for legacy users
    if (appUser && appUser.friendCode === "") {
      setGeneratingCode(true);
      const newCode = generateFriendCode();
      await updateUser(firebaseUser.uid, { friendCode: newCode });
      await refreshAppUser();
      setGeneratingCode(false);
    }

    // Load pending gifts
    try {
      const gifts = await getGiftOrdersForRecipient(firebaseUser.uid);
      setPendingGifts(gifts);
    } catch (err) {
      console.error("Failed to load gift orders:", err);
    } finally {
      setLoadingActivity(false);
    }

    // Load friend profiles
    if (appUser && appUser.friends.length > 0) {
      try {
        const profiles = await getFriendProfiles(appUser.friends);
        setFriendProfiles(profiles);
      } catch (err) {
        console.error("Failed to load friend profiles:", err);
      }
    }
    setLoadingFriends(false);
  }, [firebaseUser, appUser, refreshAppUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Copy friend code
  function handleCopyCode() {
    if (!appUser?.friendCode) return;
    navigator.clipboard.writeText(appUser.friendCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  // Send friend request
  async function handleSendRequest() {
    if (!firebaseUser || !appUser) return;
    const code = requestInput.trim();
    if (!code) return;

    setSendingRequest(true);
    setRequestError(null);
    setRequestSuccess(null);

    const error = await sendFriendRequest(
      firebaseUser.uid,
      appUser.displayName,
      code,
      appUser.friends,
      appUser.outgoingRequests,
    );

    if (error) {
      setRequestError(error);
    } else {
      setRequestSuccess("Friend request sent!");
      setRequestInput("");
      await refreshAppUser();
    }
    setSendingRequest(false);
  }

  // Accept friend request
  async function handleAcceptRequest(fromUid: string) {
    if (!firebaseUser) return;
    await acceptFriendRequest(firebaseUser.uid, fromUid);
    await refreshAppUser();
    // Reload friend profiles
    const updated = await getFriendProfiles([
      ...(appUser?.friends ?? []),
      fromUid,
    ]);
    setFriendProfiles(updated);
  }

  // Decline freind request
  async function handleDeclineRequest(fromUid: string) {
    if (!firebaseUser) return;
    await declineFriendRequest(firebaseUser.uid, fromUid);
    await refreshAppUser();
  }

  // Remove friend
  async function handleRemoveFriend(friendUid: string) {
    if (!firebaseUser) return;
    await Promise.all([
      removeFriend(firebaseUser.uid, friendUid),
      removeFriend(friendUid, firebaseUser.uid),
    ]);
    await refreshAppUser();
    setFriendProfiles((prev) => prev.filter((f) => f.uid !== friendUid));
    // Close wishlist view if viewing this friend
    if (viewingFriend?.uid === friendUid) setViewingFriend(null);
  }

  // Open gift acceptance modal
  function handleAcceptGift(order: Order) {
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
    }
  }

  // Decline gift
  async function handleDeclineGift(orderId: string) {
    await updateOrderStatus(orderId, "refunded");
    setPendingGifts((prev) => prev.filter((o) => o.id !== orderId));
  }

  // Guard
  if (!appUser) return null;

  const hasActivity =
    appUser.incomingRequests.length > 0 || pendingGifts.length > 0;

  // Render: Friend Wishlist
  if (viewingFriend) {
    return (
      <FriendWishlistView
        friend={viewingFriend}
        onBack={() => setViewingFriend(null)}
      />
    );
  }

  // Render: Friends Page
  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        <div className="flex-1 min-w-0 space-y-8">
          {/* Activity Section */}
          {!loadingActivity && hasActivity && (
            <section>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Activity</h3>

              <div className="space-y-3">
                {/* Incoming friend requests */}
                {appUser.incomingRequests.map((req) => (
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
                      {/* Thumbnails */}
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
                          {order.senderDisplayName || "Someone"} sent you a
                          gift!
                        </p>
                        <p className="text-xs text-black/40 mt-0.5">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""} ·{" "}
                          {formatPrice(order.totalAmount)}
                        </p>
                        {order.giftMessage && (
                          <p className="text-xs text-black/60 mt-1.5 italic">
                            "{order.giftMessage}"
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 flex-shrink-0 self-start">
                        <button
                          onClick={() => handleAcceptGift(order)}
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
              </div>
            </section>
          )}

          {/* Loading for activity */}
          {loadingActivity && (
            <section>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Activity</h3>
              <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
                <p className="text-sm text-black/40">Loading activity...</p>
              </div>
            </section>
          )}

          {/* No activity message */}
          {!loadingActivity && !hasActivity && (
            <section>
              <h3 className="text-xl md:text-2xl font-bold mb-4">Activity</h3>
              <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
                <p className="text-sm text-black/40">No activity right now.</p>
              </div>
            </section>
          )}

          {/* Friends Section */}
          <section>
            <h3 className="text-xl md:text-2xl font-bold mb-4">My Friends</h3>

            {/* Send friend request */}
            <div className="rounded-[20px] border border-black/10 p-4 md:p-5 mb-4">
              <p className="text-sm font-semibold text-black mb-3">
                Add a Friend
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={requestInput}
                  onChange={(e) => {
                    setRequestInput(e.target.value);
                    setRequestError(null);
                    setRequestSuccess(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                  placeholder="Enter friend code (e.g. aB3xZ7qR)"
                  className="flex-1 h-10 px-4 rounded-full border border-black/20 text-sm placeholder:text-black/30 focus:outline-none focus:border-black/50"
                />
                <button
                  onClick={handleSendRequest}
                  disabled={sendingRequest || !requestInput.trim()}
                  className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black/80 transition-all disabled:opacity-40 whitespace-nowrap"
                >
                  {sendingRequest ? "Sending…" : "Send Request"}
                </button>
              </div>
              {requestError && (
                <p className="text-xs text-red-500 mt-2">{requestError}</p>
              )}
              {requestSuccess && (
                <p className="text-xs text-green-600 mt-2">{requestSuccess}</p>
              )}
            </div>

            {/* Friends list */}
            {loadingFriends ? (
              <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
                <p className="text-sm text-black/40">Loading friends...</p>
              </div>
            ) : friendProfiles.length === 0 ? (
              <div className="rounded-[20px] border border-black/10 p-5 md:p-8 text-center">
                <FiUsers className="text-3xl text-black/20 mx-auto mb-3" />
                <p className="text-sm font-semibold text-black/60 mb-1">
                  No friends yet
                </p>
                <p className="text-xs text-black/40">
                  Share your friend code with others to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendProfiles.map((friend) => (
                  <div
                    key={friend.uid}
                    className="rounded-[20px] border border-black/10 p-4 md:p-5 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                      <FiUsers className="text-black/40 text-base" />
                    </div>
                    <p className="flex-1 font-semibold text-sm md:text-base text-black truncate">
                      {friend.displayName}
                    </p>
                    <div className="flex gap-2 flex-shrink-0">
                      {/* View Wishlist */}
                      <button
                        onClick={() => setViewingFriend(friend)}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-black/10 flex items-center justify-center hover:border-black/40 hover:text-black text-black/40 transition-all"
                        title="View wishlist"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      {/* Remove Friend */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-black/10 flex items-center justify-center hover:border-red-500 hover:text-red-500 text-black/40 transition-all"
                            title="Remove friend"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Friend</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove{" "}
                              <span className="font-semibold text-black">
                                {friend.displayName}
                              </span>{" "}
                              from your friends list? They won't be notified,
                              but you'll need to send a new request to
                              reconnect.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveFriend(friend.uid)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Friend Code Panel (right) */}
        <aside className="w-full lg:w-[260px] flex-shrink-0 lg:sticky lg:top-[100px] self-start">
          <div className="rounded-[20px] border border-black/10 p-5">
            <h4 className="font-bold text-base mb-1">Your Friend Code</h4>
            <p className="text-xs text-black/40 mb-4">
              Share this code so others can add you as a friend.
            </p>

            {generatingCode ? (
              <p className="text-sm text-black/40">Generating code…</p>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 h-10 px-4 rounded-full border border-black/20 bg-[#F9F9F9] flex items-center">
                  <span className="text-sm font-mono font-semibold tracking-widest text-black">
                    {appUser.friendCode || "—"}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  disabled={!appUser.friendCode}
                  className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:border-black/40 transition-all disabled:opacity-40"
                  title="Copy code"
                >
                  {codeCopied ? (
                    <FiCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <FiCopy className="w-4 h-4 text-black/50" />
                  )}
                </button>
              </div>
            )}
            {codeCopied && (
              <p className="text-xs text-green-600 mt-2">Friend code copied!</p>
            )}
          </div>
        </aside>
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
                Add an address →
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
