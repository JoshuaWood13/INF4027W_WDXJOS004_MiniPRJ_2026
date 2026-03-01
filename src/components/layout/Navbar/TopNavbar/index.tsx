"use client";

import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { NavMenu } from "../navbar.types";
import { MenuList } from "./MenuList";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MenuItem } from "./MenuItem";
import Image from "next/image";
import InputGroup from "@/components/ui/input-group";
import ResTopNavbar from "./ResTopNavbar";
import CartBtn from "./CartBtn";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks/redux";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { PiSparkleBold } from "react-icons/pi";
import AISearchPanel from "./AISearchPanel";
import { useActivityCount } from "@/lib/hooks/useActivityCount";
import { showSuccessToast } from "@/components/ui/SuccessToast";

const data: NavMenu = [
  {
    id: 1,
    label: "Shop",
    type: "MenuList",
    children: [
      {
        id: 11,
        label: "Gaming Laptops",
        url: "/shop?category=gaming",
        description: "High-performance laptops built for gaming",
      },
      {
        id: 12,
        label: "Business Laptops",
        url: "/shop?category=business",
        description: "Reliable and professional laptops for work",
      },
      {
        id: 13,
        label: "Student Laptops",
        url: "/shop?category=student",
        description: "Affordable laptops perfect for studying",
      },
      {
        id: 14,
        label: "Ultrabooks",
        url: "/shop?category=ultrabook",
        description: "Slim, lightweight, and powerful laptops",
      },
    ],
  },
  {
    id: 2,
    type: "MenuItem",
    label: "On Sale",
    url: "/shop?onSale=true",
    children: [],
  },
  {
    id: 3,
    type: "MenuItem",
    label: "Featured",
    url: "/shop?featured=true",
    children: [],
  },
  {
    id: 4,
    type: "MenuItem",
    label: "All Laptops",
    url: "/shop",
    children: [],
  },
];

const TopNavbar = () => {
  const { firebaseUser, appUser, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const aiPanelRef = useRef<HTMLDivElement>(null);
  const { count: activityCount } = useActivityCount();
  const [isSearching, setIsSearching] = useState(false);

  // Handle search query
  function handleSearch() {
    setIsSearching(true);
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/shop`);
    }
  }

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close AI panel on outside click
  useEffect(() => {
    function handleAiClickOutside(e: MouseEvent) {
      if (
        aiPanelRef.current &&
        !aiPanelRef.current.contains(e.target as Node)
      ) {
        setAiPanelOpen(false);
      }
    }
    if (aiPanelOpen) {
      document.addEventListener("mousedown", handleAiClickOutside);
    }
    return () =>
      document.removeEventListener("mousedown", handleAiClickOutside);
  }, [aiPanelOpen]);

  const isLoggedIn = !loading && !!firebaseUser;
  const isAdmin = appUser?.role === "admin";

  async function handleSignOut() {
    setDropdownOpen(false);
    dispatch(clearCart());
    await signOut();
    router.push("/");
    showSuccessToast("Logged out successfully!");
  }

  // Update search query for back/forward navigation
  useEffect(() => {
    const search = searchParams.get("search") || "";
    setSearchQuery(search);
    setIsSearching(false);
  }, [searchParams]);

  return (
    <nav className="sticky top-0 bg-white z-20">
      <div className="flex relative max-w-frame mx-auto items-center justify-between md:justify-start py-5 md:py-6 px-4 xl:px-0">
        <div className="flex items-center">
          <div className="block md:hidden mr-4">
            <ResTopNavbar data={data} />
          </div>
          <Link
            href="/"
            className={cn([
              integralCF.className,
              "text-2xl lg:text-[32px] mb-2 mr-3 lg:mr-10",
            ])}
          >
            LaptopWRLD
          </Link>
        </div>
        <NavigationMenu className="hidden md:flex mr-2 lg:mr-7">
          <NavigationMenuList>
            {data.map((item) => (
              <React.Fragment key={item.id}>
                {item.type === "MenuItem" && (
                  <MenuItem label={item.label} url={item.url} />
                )}
                {item.type === "MenuList" && (
                  <MenuList data={item.children} label={item.label} />
                )}
              </React.Fragment>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <InputGroup className="hidden md:flex bg-[#F0F0F0] mr-3 lg:mr-10">
          <InputGroup.Text>
            <button
              type="submit"
              onClick={handleSearch}
              aria-label="Search"
              className="flex items-center"
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="w-5 h-5 min-w-5 min-h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
              ) : (
                <Image
                  priority
                  src="/icons/search.svg"
                  height={20}
                  width={20}
                  alt="search"
                  className="min-w-5 min-h-5"
                />
              )}
            </button>
          </InputGroup.Text>
          <InputGroup.Input
            type="search"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder={
              isSearching ? "Searching..." : "Search for products..."
            }
            className="bg-transparent placeholder:text-black/40"
            disabled={isSearching}
          />
        </InputGroup>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="block md:hidden mr-[14px] p-1"
            aria-label="Search"
          >
            <Image
              priority
              src="/icons/search-black.svg"
              height={100}
              width={100}
              alt="search"
              className="max-w-[22px] max-h-[22px]"
            />
          </button>

          {/* AI search trigger */}
          <div className="relative mr-[14px]" ref={aiPanelRef}>
            <button
              type="button"
              onClick={() => {
                setAiPanelOpen((prev) => !prev);
                setDropdownOpen(false);
              }}
              className="p-1 -top-0.5 relative"
              aria-label="AI product search"
              aria-expanded={aiPanelOpen}
            >
              <PiSparkleBold size={25} />
            </button>
            {aiPanelOpen && (
              <AISearchPanel onClose={() => setAiPanelOpen(false)} />
            )}
          </div>

          {/* Cart button */}
          <CartBtn />

          {/* User icon + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="p-1 relative top-[2px]"
              aria-label="User menu"
              aria-expanded={dropdownOpen}
            >
              <Image
                priority
                src="/icons/user.svg"
                height={100}
                width={100}
                alt="user"
                className="max-w-[22px] max-h-[22px]"
              />
              {isLoggedIn && activityCount > 0 && (
                <span className="border bg-black text-white rounded-full w-fit px-1 text-xs absolute -top-[12.5px] left-1/2 -translate-x-1/2">
                  {activityCount}
                </span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-black/5 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {isLoggedIn ? (
                  <>
                    {/* User info */}
                    <div className="px-4 py-2.5 border-b border-black/5">
                      <p className="font-medium text-sm truncate">
                        {appUser?.displayName ||
                          firebaseUser?.displayName ||
                          "User"}
                      </p>
                      <p className="text-xs text-black/50 truncate">
                        {firebaseUser?.email}
                      </p>
                    </div>

                    {/* Admin link */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M9 3v18" />
                          <path d="m16 15-3-3 3-3" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}

                    {/* Account links */}
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 0 0-16 0" />
                      </svg>
                      My Account
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      Wishlist
                    </Link>

                    {/* Sign out */}
                    <div className="border-t border-black/5 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        Log Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Guest state */}
                    <div className="px-4 py-2.5 border-b border-black/5">
                      <p className="text-sm text-black/60">
                        Sign in to access your account
                      </p>
                    </div>
                    <Link
                      href="/auth/login"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" x2="3" y1="12" y2="12" />
                      </svg>
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" x2="19" y1="8" y2="14" />
                        <line x1="22" x2="16" y1="11" y2="11" />
                      </svg>
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
