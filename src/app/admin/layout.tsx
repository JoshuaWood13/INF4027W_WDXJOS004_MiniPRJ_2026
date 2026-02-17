"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAppDispatch } from "@/lib/hooks/redux";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiBarChart2,
  FiLogOut,
} from "react-icons/fi";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: FiHome },
  { href: "/admin/products", label: "Manage Products", icon: FiPackage },
  { href: "/admin/orders", label: "Manage Orders", icon: FiShoppingBag },
  { href: "/admin/reports", label: "Reports", icon: FiBarChart2 },
] as const;

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { appUser, signOut } = useAuth();

  async function handleSignOut() {
    router.push("/");
    dispatch(clearCart());
    await signOut();
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        {/* Page heading */}
        <h2
          className={cn(
            integralCF.className,
            "font-bold text-[32px] md:text-[40px] text-black uppercase mb-1 md:mb-2 pt-5 md:pt-6",
          )}
        >
          Admin Dashboard
        </h2>
        <p className="text-black/60 text-sm md:text-base mb-6 md:mb-8">
          Welcome, {appUser?.displayName || "Admin"}
        </p>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
          {/* Sidebar navigation */}
          <aside className="w-full md:w-[220px] lg:w-[250px] flex-shrink-0">
            {/* Mobile horizontal scrollable nav */}
            <nav className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                      active
                        ? "bg-black text-white"
                        : "bg-[#F0F0F0] text-black/60 hover:text-black hover:bg-black/10",
                    )}
                  >
                    <item.icon className="text-base" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-[#F0F0F0] text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiLogOut className="text-base" />
                Log Out
              </button>
            </nav>

            {/* Desktop vertical sidebar */}
            <nav className="hidden md:flex flex-col border-r border-black/10 pr-6 lg:pr-8 min-h-[400px]">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 py-3 px-3 -mr-px border-r-2 text-sm transition-colors",
                      active
                        ? "border-black text-black font-semibold"
                        : "border-transparent text-black/50 hover:text-black hover:border-black/20",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "text-lg",
                        active ? "text-black" : "text-black/40",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="border-t border-black/10 my-2" />

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 py-3 px-3 text-sm text-red-600 hover:text-red-700 transition-colors text-left"
              >
                <FiLogOut className="text-lg" />
                Log Out
              </button>
            </nav>
          </aside>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute adminOnly={true}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
