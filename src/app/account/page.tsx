"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { updateUser } from "@/lib/firestore/users";
import { FiCheck } from "react-icons/fi";
import ActivitySection from "@/components/account/ActivitySection";
import { showSuccessToast } from "@/components/ui/SuccessToast";

export default function PersonalDetailsPage() {
  const { appUser, firebaseUser, refreshAppUser } = useAuth();

  // Editable fields
  const [displayName, setDisplayName] = useState("");

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // const [success, setSuccess] = useState(false);

  // Initialise form from appUser
  useEffect(() => {
    if (appUser) {
      setDisplayName(appUser.displayName || "");
    }
  }, [appUser]);

  // Track if anything has changed
  const hasChanges = displayName.trim() !== (appUser?.displayName || "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!appUser) return;

    setError("");

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError("Display name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await updateUser(appUser.uid, { displayName: trimmedName });
      await refreshAppUser();
      showSuccessToast("Profile updated successfully!");

    } catch (err: any) {
      setError(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Format member since date
  const memberSince = appUser?.createdAt
    ? new Date(appUser.createdAt).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div>
      {/* Activity feed */}
      {appUser && firebaseUser && <ActivitySection />}

      <h3 className="text-xl md:text-2xl font-bold mb-6">Personal Details</h3>

      <form onSubmit={handleSave}>
        <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Display name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium mb-1.5"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full max-w-md border border-black/10 rounded-full py-3 px-4 text-sm outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-colors bg-[#F0F0F0]"
                disabled={saving}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={firebaseUser?.email || appUser?.email || ""}
                readOnly
                className="w-full max-w-md border border-black/10 rounded-full py-3 px-4 text-sm bg-[#F0F0F0] text-black/50 cursor-not-allowed"
              />
              <p className="text-xs text-black/30 mt-1.5 ml-1">
                Email cannot be changed.
              </p>
            </div>

            {/* Member siecne */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Member Since
              </label>
              <p className="text-sm text-black/60 px-1">{memberSince}</p>
            </div>
          </div>

          {/* Save button */}
          <div className="mt-8 pt-5 border-t border-black/10">
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="bg-black text-white rounded-full py-3 px-8 text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
