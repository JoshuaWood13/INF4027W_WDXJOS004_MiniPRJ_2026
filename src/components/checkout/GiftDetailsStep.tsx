"use client";

import React from "react";
import Link from "next/link";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader";

// Types
type Friend = { uid: string; displayName: string };

type GiftDetailsStepProps = {
  friends: Friend[];
  friendsLoading: boolean;
  selectedUid: string | null;
  message: string;
  error: string;
  onRecipientSelect: (uid: string, displayName: string) => void;
  onMessageChange: (msg: string) => void;
  onBack: () => void;
  onContinue: () => void;
  showBack: boolean;
};

const MAX_MESSAGE_LENGTH = 200;

export default function GiftDetailsStep({
  friends,
  friendsLoading,
  selectedUid,
  message,
  error,
  onRecipientSelect,
  onMessageChange,
  onBack,
  onContinue,
  showBack,
}: GiftDetailsStepProps) {
  return (
    <div>
      <h3 className="text-lg md:text-xl font-bold mb-4">Gift Details</h3>

      {/* Validation error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Recipient selection */}
      <div className="mb-6">
        <p className="text-sm font-semibold mb-3">Select Recipient</p>

        {friendsLoading ? (
          <div className="flex items-center gap-2 text-sm text-black/50 py-4">
            <SpinnerbLoader className="w-5 border-2 border-gray-300 border-r-gray-600" />
            Loading friends…
          </div>
        ) : friends.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-[#F9F9F9] p-5 text-sm text-black/60">
            <p className="mb-2 font-medium text-black">No friends yet</p>
            <p className="mb-3">
              You need to add friends before you can send gifts.
            </p>
            <Link
              href="/account/friends"
              className="inline-block rounded-full bg-black text-white text-xs px-4 py-2 hover:bg-black/80 transition-colors"
            >
              Go to Friends
            </Link>
          </div>
        ) : (
          <select
            value={selectedUid ?? ""}
            onChange={(e) => {
              const uid = e.target.value;
              const friend = friends.find((f) => f.uid === uid);
              if (friend) onRecipientSelect(friend.uid, friend.displayName);
            }}
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black/20"
          >
            <option value="" disabled>
              Select a friend…
            </option>
            {friends.map((friend) => (
              <option key={friend.uid} value={friend.uid}>
                {friend.displayName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Gift message */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Gift Message</p>
          <span className="text-xs text-black/40">
            {message.length} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <textarea
          value={message}
          onChange={(e) => {
            if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
              onMessageChange(e.target.value);
            }
          }}
          placeholder="Write a personal message… (optional)"
          rows={3}
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-black/20 placeholder:text-black/30"
        />
      </div>

      {/* Navigation buttons */}
      <div className="flex space-x-3">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-black/10 text-black rounded-full py-3.5 px-4 font-medium hover:bg-black/5 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={friends.length === 0}
          className="flex-1 bg-black text-white rounded-full py-3.5 px-4 font-medium hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
