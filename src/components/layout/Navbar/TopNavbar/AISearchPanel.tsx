"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/firestore/products";
import { PiSparkleBold } from "react-icons/pi";
import { runTextSearch, runImageSearch } from "@/lib/ai/prompts";

type Props = {
  onClose: () => void;
};

const AISearchPanel = ({ onClose }: Props) => {
  const router = useRouter();

  // Text search state
  const [textQuery, setTextQuery] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  // Image search state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle selecting / dropping an image file
  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    setImageFile(file);
    setImageError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageFile(file);
    },
    [handleImageFile],
  );

  // Text prompt search
  async function handleTextSearch() {
    const query = textQuery.trim();
    if (!query || textLoading) return;

    setTextLoading(true);
    setTextError(null);

    try {
      const products = await getProducts();
      const ids = await runTextSearch(query, products);

      if (ids.length === 0) {
        setTextError(
          "No matching products found. Try rephrasing your query or broadening your requirements.",
        );
        return;
      }

      onClose();
      router.push(`/shop?aiResults=${ids.join(",")}`);
    } catch (err) {
      console.error("AI text search error:", err);
      setTextError("AI search failed. Please try again in a moment.");
    } finally {
      setTextLoading(false);
    }
  }

  // Image search
  async function handleImageSearch() {
    if (!imageFile || imageLoading) return;

    setImageLoading(true);
    setImageError(null);

    try {
      const products = await getProducts();
      const ids = await runImageSearch(imageFile, products);

      if (ids.length === 0) {
        setImageError(
          "Could not find similar products for this image. Try uploading a clearer photo.",
        );
        return;
      }

      onClose();
      router.push(`/shop?aiResults=${ids.join(",")}`);
    } catch (err) {
      console.error("AI image search error:", err);
      setImageError("Image search failed. Please try again in a moment.");
    } finally {
      setImageLoading(false);
    }
  }

  // Render
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 sm:hidden"
        onClick={onClose}
        aria-hidden
      />

      {/*
       * Mobile  : fixed full-width bottom sheet
       * Desktop : absolute dropdown panel anchored to the right
       */}
      <div
        className="
        fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl
        sm:absolute sm:inset-x-auto sm:bottom-auto
        sm:right-0 sm:top-full sm:mt-2
        sm:w-[420px] sm:max-w-[calc(100vw-16px)]
        sm:rounded-2xl sm:shadow-xl
        border border-black/8 overflow-hidden
      "
      >
        {/* Drag handle (mobile)*/}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-black/15" />
        </div>

        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <div className="flex items-center gap-2">
            <PiSparkleBold size={16} />
            <span className="font-semibold text-sm">AI Product Search</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI search"
            className="w-6 h-6 flex items-center justify-center rounded-full text-black/40 hover:text-black hover:bg-black/5 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[75dvh] sm:max-h-[80vh] overflow-y-auto">
          {/* Text prompt*/}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-black">
                Describe what you&apos;re looking for
              </h3>
              <p className="text-xs text-black/40 mt-0.5">
                e.g. &quot;Gaming laptop under R20k with 16GB RAM and a
                dedicated GPU&quot;
              </p>
            </div>

            <textarea
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSearch();
                }
              }}
              placeholder="Describe your ideal laptop..."
              rows={3}
              className="w-full rounded-xl border border-black/10 bg-[#F8F8F8] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-black/25 transition-shadow"
            />

            {textError && (
              <p className="text-xs text-red-500 leading-relaxed">
                {textError}
              </p>
            )}

            <button
              onClick={handleTextSearch}
              disabled={!textQuery.trim() || textLoading}
              className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-black/85 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {textLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  Searching with AI…
                </>
              ) : (
                <>
                  <PiSparkleBold size={14} />
                  Search with AI
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-black/8" />
            <span className="text-xs text-black/30 font-medium shrink-0">
              or search by image
            </span>
            <div className="flex-1 h-px bg-black/8" />
          </div>

          {/* Image upload */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-black">
                Upload a laptop image
              </h3>
              <p className="text-xs text-black/40 mt-0.5">
                Upload a photo or screenshot of a laptop you like to find
                similar products
              </p>
            </div>

            {/* Image drop area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all ${
                isDragging
                  ? "border-black/40 bg-black/3 scale-[1.01]"
                  : "border-black/10 hover:border-black/25 bg-[#F8F8F8] hover:bg-[#F0F0F0]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                  // Reset so same file can be re-selected
                  e.target.value = "";
                }}
              />

              {imagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 max-w-full rounded-lg object-contain"
                  />
                  <p className="text-xs text-black/40 truncate max-w-full px-2">
                    {imageFile?.name}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-black/30"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <p className="text-sm text-black/40 text-center">
                    Drag &amp; drop or{" "}
                    <span className="text-black underline">browse</span>
                  </p>
                  <p className="text-xs text-black/25">JPG, PNG, WEBP</p>
                </div>
              )}
            </div>

            {imageError && (
              <p className="text-xs text-red-500 leading-relaxed">
                {imageError}
              </p>
            )}

            {/* Action buttons */}
            {imageFile && (
              <div className="flex gap-2">
                <button
                  onClick={handleImageSearch}
                  disabled={imageLoading}
                  className="flex-1 bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-black/85 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {imageLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      Analysing image…
                    </>
                  ) : (
                    <>
                      <PiSparkleBold size={14} />
                      Find Similar
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    setImageError(null);
                  }}
                  className="px-3 py-2.5 rounded-xl border border-black/10 text-sm text-black/50 hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AISearchPanel;
