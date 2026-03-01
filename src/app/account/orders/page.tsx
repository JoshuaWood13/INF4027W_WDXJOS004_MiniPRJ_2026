"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getOrdersByUser, getReceivedGiftOrders } from "@/lib/firestore/orders";
import { Order } from "@/types/order.types";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

const ORDERS_PER_PAGE = 3;

export default function OrdersPage() {
  const { appUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchOrders() {
      if (!appUser) return;
      try {
        // Fetch own orders and received gifts in parallel
        const [ownOrders, receivedGifts] = await Promise.all([
          getOrdersByUser(appUser.uid),
          getReceivedGiftOrders(appUser.uid),
        ]);

        // Merge, deduplicate by ID, and sort newest first (exclude pending received gifts)
        const merged = [
          ...ownOrders,
          ...receivedGifts.filter(
            (g) =>
              !ownOrders.some((o) => o.id === g.id) && g.status !== "pending",
          ),
        ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setOrders(merged);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [appUser]);

  if (loading) {
    return (
      <div>
        <h3 className="text-xl md:text-2xl font-bold mb-6">Orders</h3>
        <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
          <p className="text-sm text-black/40">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h3 className="text-xl md:text-2xl font-bold mb-6">Orders</h3>
        <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
          <p className="text-sm text-black/40">
            You haven&apos;t placed any orders yet.
          </p>
        </div>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      <h3 className="text-xl md:text-2xl font-bold mb-6">Orders</h3>
      <div className="space-y-4 mb-6">
        {paginatedOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            currentUserUid={appUser?.uid ?? ""}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                className={cn(
                  currentPage === 1 && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>

            {getPageNumbers().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                  }}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                className={cn(
                  currentPage === totalPages &&
                    "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function OrderCard({
  order,
  currentUserUid,
}: {
  order: Order;
  currentUserUid: string;
}) {
  // Get first 8 items for thumbnails
  const displayItems = order.items.slice(0, 8);
  const remainingCount = order.items.length - 8;

  // Determine order type for labeling
  const isSentGift = order.isGift && order.userId === currentUserUid;
  const isReceivedGift =
    order.isGift && order.giftRecipientId === currentUserUid;

  // Status badge styles
  const statusStyles: Record<string, string> = {
    complete: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    refunded: "bg-red-100 text-red-800 border-red-200",
  };

  // Status labels
  function getStatusLabel() {
    if (isSentGift || isReceivedGift) {
      if (order.status === "pending") return "Awaiting Acceptance";
      if (order.status === "complete") return "Accepted";
      if (order.status === "refunded") return "Declined";
    }
    if (order.status === "complete") return "Delivered";
    if (order.status === "refunded") return "Refunded";
    return "Order Placed";
  }

  // Card heading
  function getHeading() {
    // Format date for gift orders
    const formattedDate = order.createdAt.toLocaleDateString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    if (isSentGift) {
      return `Gift Sent to ${order.recipientDisplayName ?? "Recipient"} - ${formattedDate}`;
    }
    if (isReceivedGift) {
      return `Gift from ${order.senderDisplayName ?? "Someone"} - ${formattedDate}`;
    }
    // Regular order — show delivery status + date
    const statusText =
      order.status === "complete" ? "Delivered" : "Order Placed";
    return `${statusText} ${formattedDate}`;
  }

  // Format date for gift orders (no "Delivered/Order Placed" prefix)
  // const formattedDate = order.createdAt.toLocaleDateString("en-ZA", {
  //   day: "numeric",
  //   month: "short",
  //   year: "numeric",
  // });

  return (
    <Link
      href={`/order-confirmation/${order.id}`}
      className="block rounded-[20px] border border-black/10 p-5 md:p-6 hover:border-black/20 transition-colors"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h4 className="text-base md:text-lg font-bold text-black">
            {getHeading()}
          </h4>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border capitalize self-start whitespace-nowrap",
            statusStyles[order.status] ??
              "bg-gray-100 text-gray-800 border-gray-200",
          )}
        >
          {getStatusLabel()}
        </span>
      </div>

      {/* Product thumbnails */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#F0F0F0] flex-shrink-0"
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-16 h-16 rounded-lg bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
            <p className="text-xs font-medium text-black/60">
              +{remainingCount}
            </p>
          </div>
        )}
      </div>

      {/* Total and action */}
      <div className="flex items-center justify-between pt-4 border-t border-black/10">
        <div>
          <p className="text-xs text-black/40 mb-1">Total</p>
          <p className="text-lg font-bold">
            R {order.totalAmount.toLocaleString("en-ZA")}
          </p>
        </div>
        <span className="text-sm font-medium text-black/60 hover:text-black transition-colors">
          View Order →
        </span>
      </div>
    </Link>
  );
}
