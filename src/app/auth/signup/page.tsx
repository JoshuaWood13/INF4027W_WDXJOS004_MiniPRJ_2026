"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { Suspense } from "react";
import { FcGoogle } from "react-icons/fc";

function SignUpForm() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: typeof errors = {};

    // Basic validation
    if (!displayName.trim()) {
      newErrors.displayName = "Please enter your name.";
    }
    if (!email.trim()) {
      newErrors.email = "Please enter your email.";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // Show any validation errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await signUp(email, password, displayName.trim());
      router.push(redirectTo);
      // Handle firebase auth errors
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/email-already-in-use") {
        setErrors({ email: "An account with this email already exists." });
      } else if (code === "auth/invalid-email") {
        setErrors({ email: "Please enter a valid email address." });
      } else if (code === "auth/weak-password") {
        setErrors({
          password: "Password is too weak. Please use at least 6 characters.",
        });
      } else {
        setErrors({
          general: err?.message || "Something went wrong. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrors({});
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(redirectTo);
      // Handle firebase auth errors
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        // Closed popup not an error
      } else {
        setErrors({
          general: err?.message || "Google sign-in failed. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={cn(integralCF.className, "text-3xl lg:text-4xl mb-3")}>
            CREATE ACCOUNT
          </h1>
          <p className="text-black/60 text-sm">
            Sign up to start shopping at LaptopWRLD
          </p>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-black/10 rounded-full py-3 px-4 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          <FcGoogle size={20} />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-black/10" />
          <span className="text-sm text-black/40">or</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        {/* General error */}
        {errors.general && (
          <p className="text-red-500 text-xs mb-4">{errors.general}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium mb-1.5"
            >
              Full Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setErrors((prev) => ({ ...prev, displayName: undefined }));
              }}
              placeholder="John Doe"
              className={cn(
                "w-full border rounded-full py-3 px-4 text-sm outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-colors bg-[#F0F0F0]",
                errors.displayName ? "border-red-400" : "border-black/10",
              )}
              disabled={loading}
            />
            {errors.displayName && (
              <p className="text-red-500 text-xs mt-1 ml-4">
                {errors.displayName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="john@example.com"
              className={cn(
                "w-full border rounded-full py-3 px-4 text-sm outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-colors bg-[#F0F0F0]",
                errors.email ? "border-red-400" : "border-black/10",
              )}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-4">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="At least 6 characters"
              className={cn(
                "w-full border rounded-full py-3 px-4 text-sm outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-colors bg-[#F0F0F0]",
                errors.password ? "border-red-400" : "border-black/10",
              )}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-4">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-1.5"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Re-enter your password"
              className={cn(
                "w-full border rounded-full py-3 px-4 text-sm outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-colors bg-[#F0F0F0]",
                errors.confirmPassword ? "border-red-400" : "border-black/10",
              )}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 ml-4">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-full py-3 px-4 font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-center text-sm text-black/60 mt-6">
          Already have an account?{" "}
          <Link
            href={`/auth/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="text-black font-medium underline underline-offset-2 hover:text-black/70"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
