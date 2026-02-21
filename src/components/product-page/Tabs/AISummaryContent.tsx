"use client";

import React, { useState } from "react";
import { Product } from "@/types/product.types";
import { generateProductSummary } from "@/lib/ai/prompts";
import { PiSparkleBold } from "react-icons/pi";

const CACHE_KEY = (id: string) => `ai_summary_${id}`;

const AISummaryContent = ({ product }: { product: Product }) => {
  // Initialise from sessionStorage if available
  const [summary, setSummary] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(CACHE_KEY(product.id));
      if (cached) return cached;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cacheSummary(text: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(CACHE_KEY(product.id), text);
    }
    setSummary(text);
  }

  // Generates a new product AI summary and updates state with the result
  async function generateSummary() {
    setLoading(true);
    setError(null);

    try {
      const text = await generateProductSummary(product);
      cacheSummary(text);
    } catch (err) {
      console.error("AI summary generation error:", err);
      setError(
        "Failed to generate AI summary. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-black">
          AI-Powered Summary
        </h3>
        {/* Show regenerate button only when a summary is already displayed */}
        {summary && !loading && (
          <button
            onClick={generateSummary}
            className="flex items-center gap-1.5 text-xs text-black/50 hover:text-black transition-colors px-3 py-1.5 rounded-lg hover:bg-black/5"
          >
            <PiSparkleBold size={13} />
            Regenerate
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-[#F8F8F8] rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-black">
              Generating summary…
            </p>
            <p className="text-xs text-black/40 mt-1">
              Our AI is analysing this laptop&apos;s specs and features
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button
            onClick={generateSummary}
            className="text-sm font-medium text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary content */}
      {!loading && !error && summary && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#F8F8F8] to-[#F0F0F0] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <p className="text-sm sm:text-base text-black/80 leading-7 relative z-10">
              {summary}
            </p>
          </div>
          <p className="text-xs text-black/30 text-center">
            AI-generated summary · May not reflect all product details
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !summary && (
        <div className="bg-[#F0F0F0] rounded-2xl p-8 sm:p-12 flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
            <PiSparkleBold size={26} className="text-white" />
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-black">
              Get an AI-powered summary
            </p>
            <p className="text-sm text-black/50 max-w-xs">
              Generate a concise overview of this laptop&apos;s strengths, ideal
              use cases, and standout features.
            </p>
          </div>
          <button
            onClick={generateSummary}
            disabled={loading}
            className="flex items-center gap-2 bg-black text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-black/85 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <PiSparkleBold size={15} />
            Generate AI Summary
          </button>
        </div>
      )}
    </section>
  );
};

export default AISummaryContent;
