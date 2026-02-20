"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn, formatPrice, calcDiscountedPrice } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { useAppSelector, useAppDispatch } from "@/lib/hooks/redux";
import { RootState } from "@/lib/store";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { useAuth } from "@/lib/auth/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentSelector from "@/components/checkout/PaymentSelector";
import AddressManager from "@/components/address/AddressManager";
import { SavedAddress } from "@/types/user.types";
import { PaymentType } from "@/types/order.types";
import { createOrder } from "@/lib/firestore/orders";
import { incrementSalesCount, getProductsByIds } from "@/lib/firestore/products";
import { saveUserCart } from "@/lib/firestore/users";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FiCheck, FiMapPin, FiCreditCard, FiEdit2 } from "react-icons/fi";

const STEPS = [
  { number: 1, label: "Address" },
  { number: 2, label: "Payment" },
  { number: 3, label: "Review" },
] as const;

type OrderMode = "personal" | "gift";

// Checkout step indicator
function StepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {STEPS.map((step, idx) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        return (
          <React.Fragment key={step.number}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  isCompleted
                    ? "bg-black text-white"
                    : isActive
                    ? "bg-black text-white"
                    : "bg-black/10 text-black/40"
                )}
              >
                {isCompleted ? (
                  <FiCheck className="text-lg" strokeWidth={3} />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1.5 font-medium",
                  isActive || isCompleted ? "text-black" : "text-black/40"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-3 mb-5 max-w-[100px]",
                  step.number < currentStep ? "bg-black" : "bg-black/10"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Order mode toggle
function OrderModeToggle({
  mode,
  onModeChange,
}: {
  mode: OrderMode;
  onModeChange: (mode: OrderMode) => void;
}) {
  return (
    <div className="flex items-center mb-6">
      <div className="inline-flex rounded-full border border-black/10 p-1 bg-[#F0F0F0]">
        <button
          type="button"
          onClick={() => onModeChange("personal")}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-all",
            mode === "personal"
              ? "bg-black text-white"
              : "text-black/60 hover:text-black"
          )}
        >
          Personal
        </button>
        <button
          type="button"
          onClick={() => onModeChange("gift")}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-all",
            mode === "gift"
              ? "bg-black text-white"
              : "text-black/60 hover:text-black"
          )}
        >
          Gift
        </button>
      </div>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { firebaseUser } = useAuth();
  const { cart, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [orderMode, setOrderMode] = useState<OrderMode>("personal");

  // Selected delivery address
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(
    null
  );
  const [addressError, setAddressError] = useState("");

  // Payment method
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [paymentError, setPaymentError] = useState("");

  // Place order state
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  // Validate address selection
  function handleAddressContinue() {
    if (!selectedAddress) {
      setAddressError("Please select or add a delivery address.");
      return;
    }
    setAddressError("");
    setCurrentStep(2);
  }

  // Validate payment selection
  function handlePaymentContinue() {
    if (!paymentType) {
      setPaymentError("Please select a payment method.");
      return;
    }
    setPaymentError("");
    setCurrentStep(3);
  }

  // Place order
  async function handlePlaceOrder() {
    if (!firebaseUser || !cart || !selectedAddress || !paymentType) return;

    setPlacing(true);
    setPlaceError("");

    try {
      // Buildd order items from cart
      const cartProductIds = cart.items.map((item) => item.id);
      const cartProducts = await getProductsByIds(cartProductIds);

      const orderItems = cart.items.map((item) => {
        const product = cartProducts.find((p) => p.id === item.id);
        const cost = product?.cost ?? 0;
        return {
          productId: item.id,
          name: item.name,
          price: calcDiscountedPrice(item.price, item.discount),
          cost,
          quantity: item.quantity,
          image: item.srcUrl,
        };
      });

      const totalCost = orderItems.reduce((sum, item) => sum + item.cost * item.quantity, 0);

      // Create order in firestore
      const orderId = await createOrder({
        userId: firebaseUser.uid,
        items: orderItems,
        totalAmount: Math.round(adjustedTotalPrice),
        totalCost: Math.round(totalCost),
        shippingAddress: {
          street: selectedAddress.street,
          suburb: selectedAddress.suburb,
          city: selectedAddress.city,
          province: selectedAddress.province,
          postalCode: selectedAddress.postalCode,
        },
        paymentType,
        status: "complete",
        isGift: false,
        isAutoBuy: false,
      });

      // Add sale count 
      await Promise.all(
        cart.items.map((item) => incrementSalesCount(item.id, item.quantity))
      );

      // Clear cart in firestore
      await saveUserCart(firebaseUser.uid, []);

      // Clear redux cart
      dispatch(clearCart());

      // Redirect to order confirmation page
      router.push(`/order-confirmation/${orderId}`);
    } catch (err: any) {
      console.error("Failed to place order:", err);
      setPlaceError(
        err?.message || "Something went wrong. Please try again."
      );
      setPlacing(false);
    }
  }

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (!placing && (!cart || cart.items.length === 0)) {
      router.replace("/cart");
    }
  }, [cart, placing, router]);

  if (!placing && (!cart || cart.items.length === 0)) {
    return null;
  }

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
              <BreadcrumbLink asChild>
                <Link href="/cart">Cart</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page title */}
        <h2
          className={cn([
            integralCF.className,
            "font-bold text-[32px] md:text-[40px] text-black uppercase mb-5 md:mb-6",
          ])}
        >
          Checkout
        </h2>

        <div className="flex flex-col lg:flex-row space-y-5 lg:space-y-0 lg:space-x-5 items-start">
          {/* Checkout form */}
          <div className="w-full p-5 md:p-8 rounded-[20px] border border-black/10">
            {/* Order type toggle */}
            <OrderModeToggle mode={orderMode} onModeChange={setOrderMode} />

            {/* Gift placeholder */}
            {orderMode === "gift" && (
              <div className="bg-[#F0F0F0] rounded-xl p-4 mb-6 text-sm text-black/60">
                Gift ordering to be implemented
              </div>
            )}

            {/* Step indicator */}
            <StepIndicator currentStep={currentStep} />

            {/* Step content */}
            <div className="min-h-[300px]">
              {currentStep === 1 && (
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-4">
                    Shipping Address
                  </h3>

                  {addressError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                      {addressError}
                    </div>
                  )}

                  <AddressManager
                    selectedId={selectedAddress?.id ?? null}
                    onSelect={(addr) => {
                      setSelectedAddress(addr);
                      if (addressError) setAddressError("");
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleAddressContinue}
                    disabled={orderMode === "gift"}
                    className="mt-6 w-full bg-black text-white rounded-full py-3.5 px-4 font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-4">
                    Payment Method
                  </h3>

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                      {paymentError}
                    </div>
                  )}

                  <PaymentSelector
                    selected={paymentType}
                    onSelect={(type) => {
                      setPaymentType(type);
                      if (paymentError) setPaymentError("");
                    }}
                  />

                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border border-black/10 text-black rounded-full py-3.5 px-4 font-medium hover:bg-black/5 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePaymentContinue}
                      className="flex-1 bg-black text-white rounded-full py-3.5 px-4 font-medium hover:bg-black/80 transition-colors"
                    >
                      Continue to Review
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-5">
                    Review & Place Order
                  </h3>

                  {placeError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                      {placeError}
                    </div>
                  )}

                  {/* Address summary */}
                  {selectedAddress && (
                    <div className="border border-black/10 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-black/60" />
                          <span className="text-sm font-semibold">
                            Delivery Address
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="flex items-center gap-1 text-xs text-black/50 hover:text-black transition-colors"
                        >
                          <FiEdit2 className="text-xs" />
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-black/70">
                        {selectedAddress.street}
                      </p>
                      <p className="text-sm text-black/70">
                        {selectedAddress.suburb}
                        {selectedAddress.suburb && ", "}
                        {selectedAddress.city}, {selectedAddress.postalCode}
                      </p>
                      <p className="text-xs text-black/40">
                        {selectedAddress.province}
                      </p>
                    </div>
                  )}

                  {/* Payment summary */}
                  {paymentType && (
                    <div className="border border-black/10 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="text-black/60" />
                          <span className="text-sm font-semibold">
                            Payment Method
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="flex items-center gap-1 text-xs text-black/50 hover:text-black transition-colors"
                        >
                          <FiEdit2 className="text-xs" />
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-black/70">{paymentType}</p>
                    </div>
                  )}

                  {/* Items summary */}
                  {cart && (
                    <div className="border border-black/10 rounded-xl p-4 mb-4">
                      <span className="text-sm font-semibold block mb-3">
                        Items ({cart.totalQuantities})
                      </span>
                      <div className="flex flex-col gap-3">
                        {cart.items.map((item) => {
                          const discounted = calcDiscountedPrice(
                            item.price,
                            item.discount
                          );
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3"
                            >
                              <div className="bg-[#F0EEED] rounded-lg w-[48px] h-[48px] min-w-[48px] flex items-center justify-center overflow-hidden">
                                <Image
                                  src={item.srcUrl}
                                  width={48}
                                  height={48}
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
                                {formatPrice(discounted * item.quantity)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between py-3 mb-2">
                    <span className="text-base font-medium">Total</span>
                    <span className="text-lg font-bold">
                      {formatPrice(Math.round(adjustedTotalPrice))}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={placing}
                      className="flex-1 border border-black/10 text-black rounded-full py-3.5 px-4 font-medium hover:bg-black/5 transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="flex-1 bg-black text-white rounded-full py-3.5 px-4 font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {placing ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div className="w-full lg:max-w-[400px] lg:sticky lg:top-24">
            <OrderSummary />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
