"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader";

type ProtectedRouteProps = {
  children: React.ReactNode;
  // If true, only admin users can access
  adminOnly?: boolean;
};

/**
 * Client-side route guard.
 *
 * - Redirects unauthenticated users to login page.
 * - If `adminOnly` is true, redirects non-admin users to home page.
 */
export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { firebaseUser, appUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!firebaseUser) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Logged in but not admin
    if (adminOnly && appUser?.role !== "admin") {
      router.replace("/");
      return;
    }
  }, [loading, firebaseUser, appUser, adminOnly, router, pathname]);

  // Show loading spinner while auth resolves
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SpinnerbLoader className="w-10 border-2 border-gray-300 border-r-gray-600" />
      </div>
    );
  }

  // Not authenticated
  if (!firebaseUser) {
    return null;
  }

  // Admin check
  if (adminOnly && appUser?.role !== "admin") {
    return null;
  }

  // Authorized
  return <>{children}</>;
}
