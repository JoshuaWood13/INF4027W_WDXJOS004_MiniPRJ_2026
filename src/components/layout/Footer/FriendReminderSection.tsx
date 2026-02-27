"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { useAuth } from "@/lib/auth/AuthContext";
import Link from "next/link";
import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

const FriendReminderSection = () => {
  const { appUser } = useAuth();
  const isGuest = !appUser;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!appUser?.friendCode) return;
    navigator.clipboard.writeText(appUser.friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Render
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 py-9 md:py-11 px-6 md:px-16 max-w-frame mx-auto bg-black rounded-[20px]">
      <p
        className={cn([
          integralCF.className,
          "font-bold text-[32px] md:text-[40px] text-white mb-9 md:mb-0",
        ])}
      >
        ADD FRIENDS AND SHARE WISHLISTS
      </p>
      <div className="flex items-center">
        <div className="flex flex-col w-full max-w-[349px] mx-auto">
          {/* Friend code display */}
          <div className="flex items-center bg-white rounded-full h-12 mb-[14px] px-4">
            {isGuest ? (
              <span className="text-sm text-black/40 w-full text-center">
                Sign Up / Log In to see your friend code!
              </span>
            ) : (
              <>
                <span className="text-sm text-black/40 mr-2 whitespace-nowrap">
                  Your friend code:
                </span>
                <span className="flex-1 text-sm font-mono font-semibold tracking-widest text-black truncate">
                  {appUser.friendCode || "—"}
                </span>
                <button
                  onClick={handleCopy}
                  disabled={!appUser.friendCode}
                  className="ml-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 transition-colors disabled:opacity-40"
                  title="Copy friend code"
                >
                  {copied ? (
                    <FiCheck className="w-4 h-4 text-green-600" />
                  ) : (
                    <FiCopy className="w-4 h-4 text-black/50" />
                  )}
                </button>
              </>
            )}
          </div>
          <Button
            variant="secondary"
            className="text-sm sm:text-base font-medium bg-white h-12 rounded-full px-4 py-3"
            aria-label="Invite Friends"
            type="button"
            asChild
          >
            <Link href="/account/friends">Invite Friends</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FriendReminderSection;
