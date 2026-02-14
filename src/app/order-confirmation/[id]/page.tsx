"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { useAuth } from "@/lib/auth/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SpinnerbLoader from "@/components/ui/SpinnerbLoader";
import { getOrderById } from "@/lib/firestore/orders";
import { Order } from "@/types/order.types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  FiCheck,
  FiMapPin,
  FiCreditCard,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";

function OrderConfirmationContent() {
  const params = useParams();
  const orderId = params.id as string;
  const { firebaseUser } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId || !firebaseUser) return;

    async function fetchOrder() {
      try {
        const data = await getOrderById(orderId);
        if (!data) {
          setError("Order not found.");
        } else if (data.userId !== firebaseUser!.uid) {
          setError("You do not have permission to view this order.");
        } else {
          setOrder(data);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, firebaseUser]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SpinnerbLoader className="w-10 border-2 border-gray-300 border-r-gray-600" />
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <p className="text-black/60 mb-4">{error || "Order not found."}</p>
            <Link
              href="/shop"
              className="bg-black text-white rounded-full py-3 px-6 text-sm font-medium hover:bg-black/80 transition-colors"
            >
              Go to Shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Format order date
  const orderDate = order.createdAt instanceof Date
    ? order.createdAt
    : new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = orderDate.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-2 sm:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Order Confirmation</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Success header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-600 text-3xl" strokeWidth={3} />
          </div>
          <h2
            className={cn([
              integralCF.className,
              "font-bold text-[28px] md:text-[36px] text-black uppercase mb-2",
            ])}
          >
            Order Confirmed
          </h2>
          <p className="text-black/60 text-sm md:text-base">
            Thank you for your purchase! Your order has been placed
            successfully.
          </p>
        </div>

        {/* Order details card */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-black/10">
              <div>
                <span className="text-xs text-black/40 block">Order ID</span>
                <span className="text-sm font-mono font-medium text-black">
                  {order.id}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-black/40 block">Date</span>
                <span className="text-sm font-medium text-black">
                  {formattedDate}, {formattedTime}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="mb-6">
              <span
                className={cn(
                  "inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full",
                  order.status === "complete"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                )}
              >
                {order.status === "complete" ? "Complete" : "Pending"}
              </span>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FiShoppingBag className="text-black/60" />
                Items ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
              </h4>
              <div className="flex flex-col gap-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="bg-[#F0EEED] rounded-lg w-[52px] h-[52px] min-w-[52px] flex items-center justify-center overflow-hidden">
                      <Image
                        src={item.image}
                        width={52}
                        height={52}
                        className="object-contain w-full h-full"
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-black/50">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-black whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-t-black/10 mb-6" />

            {/* Address + Payment row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Delivery address */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FiMapPin className="text-black/60" />
                  Delivery Address
                </h4>
                <p className="text-sm text-black/70">
                  {order.shippingAddress.street}
                </p>
                <p className="text-sm text-black/70">
                  {order.shippingAddress.suburb}
                  {order.shippingAddress.suburb && ", "}
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="text-xs text-black/40">
                  {order.shippingAddress.province}
                </p>
              </div>

              {/* Payment method */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FiCreditCard className="text-black/60" />
                  Payment Method
                </h4>
                <p className="text-sm text-black/70">{order.paymentType}</p>
              </div>
            </div>

            <hr className="border-t-black/10 mb-4" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-base md:text-lg font-medium">Total</span>
              <span className="text-lg md:text-xl font-bold">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Action links */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              href="/shop"
              className="flex-1 text-center bg-black text-white rounded-full py-3.5 px-4 text-sm font-medium hover:bg-black/80 transition-colors group"
            >
              Continue Shopping{" "}
              <FiArrowRight className="inline ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <ProtectedRoute>
      <OrderConfirmationContent />
    </ProtectedRoute>
  );
}
