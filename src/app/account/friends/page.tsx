"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  updateUser,
  removeFriend,
  getFriendProfiles,
  sendFriendRequest,
} from "@/lib/firestore/users";
import { generateFriendCode } from "@/lib/utils";
import { FiCopy, FiCheck, FiUsers, FiEye, FiTrash2 } from "react-icons/fi";
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
  const [codeCopied, setCodeCopied] = useState(false);
  const [requestInput, setRequestInput] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);

  // Load friends
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

  // Guard
  if (!appUser) return null;

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
    </>
  );
}
