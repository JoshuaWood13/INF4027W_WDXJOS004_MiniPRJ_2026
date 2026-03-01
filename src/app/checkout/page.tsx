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
import { saveUserCart, getFriendProfiles } from "@/lib/firestore/users";
import GiftDetailsStep from "@/components/checkout/GiftDetailsStep";
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
  FiEdit2,
  FiGift,
} from "react-icons/fi";

const STEP_LABELS: Record<string, string> = {
  address: "Address",
  "gift-details": "Gift Details",
  payment: "Payment",
  review: "Review",
};

// Dynamic checkout step indicator
function StepIndicator({
  steps,
  currentStepIndex,
}: {
  steps: string[];
  currentStepIndex: number;
}) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((step, idx) => {
        const isActive = idx === currentStepIndex;
        const isCompleted = idx < currentStepIndex;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  isCompleted || isActive
                    ? "bg-black text-white"
                    : "bg-black/10 text-black/40",
                )}
              >
                {isCompleted ? (
                  <FiCheck className="text-lg" strokeWidth={3} />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1.5 font-medium",
                  isActive || isCompleted ? "text-black" : "text-black/40",
                )}
              >
                {STEP_LABELS[step] ?? step}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-[2px] mx-3 mb-5 max-w-[100px]",
                  idx < currentStepIndex ? "bg-black" : "bg-black/10",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { firebaseUser, appUser } = useAuth();
  const { cart, adjustedTotalPrice } = useAppSelector(
    (state: RootState) => state.carts,
  );

  // Detect checkout scenrio based on cart items
  const personalItems = (cart?.items ?? []).filter(
    (i) => i.itemType !== "gift",
  );
  const giftItems = (cart?.items ?? []).filter((i) => i.itemType === "gift");
  const scenario: "personal" | "gift" | "mixed" =
    giftItems.length === 0
      ? "personal"
      : personalItems.length === 0
        ? "gift"
        : "mixed";

  const steps = React.useMemo(() => {
    if (scenario === "personal") return ["address", "payment", "review"];
    if (scenario === "gift") return ["gift-details", "payment", "review"];
    return ["address", "gift-details", "payment", "review"];
  }, [scenario]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  // Delivery address (personal / mixed)
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(
    null,
  );
  const [addressError, setAddressError] = useState("");

  // Payment
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [paymentError, setPaymentError] = useState("");

  // Gift details (gift / mixed)
  const [giftRecipientUid, setGiftRecipientUid] = useState<string | null>(null);
  const [giftRecipientDisplayName, setGiftRecipientDisplayName] = useState<
    string | null
  >(null);
  const [giftMessage, setGiftMessage] = useState("");
  const [giftError, setGiftError] = useState("");
  const [friends, setFriends] = useState<
    { uid: string; displayName: string }[]
  >([]);
  const [friendsLoading, setFriendsLoading] = useState(false);

  // Load friend profiles when scenario has gifts
  useEffect(() => {
    if (scenario === "personal") return;
    if (!appUser?.friends?.length) return;
    setFriendsLoading(true);
    getFriendProfiles(appUser.friends)
      .then(setFriends)
      .catch(console.error)
      .finally(() => setFriendsLoading(false));
  }, [scenario, appUser?.friends?.join(",")]);

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
    setCurrentStepIndex((i) => i + 1);
  }

  // Validate gift details
  function handleGiftDetailsContinue() {
    if (!giftRecipientUid) {
      setGiftError("Please select a recipient.");
      return;
    }
    setGiftError("");
    setCurrentStepIndex((i) => i + 1);
  }

  // Validate payment selection
  function handlePaymentContinue() {
    if (!paymentType) {
      setPaymentError("Please select a payment method.");
      return;
    }
    setPaymentError("");
    setCurrentStepIndex((i) => i + 1);
  }

  // Place order, handling all scenarios
  async function handlePlaceOrder() {
    const needsAddress = scenario !== "gift";
    const needsGiftRecipient = scenario !== "personal";
    if (
      !firebaseUser ||
      !cart ||
      (needsAddress && !selectedAddress) ||
      !paymentType ||
      (needsGiftRecipient && !giftRecipientUid)
    )
      return;

    setPlacing(true);
    setPlaceError("");

    try {
      // Fetch product details for all cart items
      const cartProductIds = cart!.items.map((item) => item.id);
      const cartProducts = await getProductsByIds(cartProductIds);

      // Build order items array from a subset of cart items
      const buildOrderItems = (items: NonNullable<typeof cart>["items"]) =>
        items.map((item) => {
          const product = cartProducts.find((p) => p.id === item.id);
          return {
            productId: item.id,
            name: item.name,
            price: calcDiscountedPrice(item.price, item.discount),
            cost: product?.cost ?? 0,
            quantity: item.quantity,
            image: item.srcUrl,
          };
        });

      type OrderItemRow = ReturnType<typeof buildOrderItems>[number];
      // Sum total amount and cost from order items
      const sumItems = (items: OrderItemRow[]) =>
        items.reduce(
          (acc, item) => ({
            totalAmount: acc.totalAmount + item.price * item.quantity,
            totalCost: acc.totalCost + item.cost * item.quantity,
          }),
          { totalAmount: 0, totalCost: 0 },
        );

      const shippingAddr = selectedAddress
        ? {
            street: selectedAddress.street,
            suburb: selectedAddress.suburb,
            city: selectedAddress.city,
            province: selectedAddress.province,
            postalCode: selectedAddress.postalCode,
          }
        : undefined;

      // Personal order only scenario
      if (scenario === "personal") {
        const items = buildOrderItems(cart.items);
        const { totalAmount, totalCost } = sumItems(items);

        const orderId = await createOrder({
          userId: firebaseUser.uid,
          items,
          totalAmount: Math.round(totalAmount),
          totalCost: Math.round(totalCost),
          shippingAddress: shippingAddr,
          paymentType,
          status: "complete",
          isGift: false,
          isAutoBuy: false,
        });

        await Promise.all(
          cart.items.map((item) => incrementSalesCount(item.id, item.quantity)),
        );
        await saveUserCart(firebaseUser.uid, []);
        dispatch(clearCart());
        router.push(`/order-confirmation/${orderId}?from=checkout`);
      } else if (scenario === "gift") {
        // Gift order only scenario
        const items = buildOrderItems(cart.items);
        const { totalAmount, totalCost } = sumItems(items);

        const orderId = await createOrder({
          userId: firebaseUser.uid,
          items,
          totalAmount: Math.round(totalAmount),
          totalCost: Math.round(totalCost),
          paymentType,
          status: "pending",
          isGift: true,
          giftRecipientId: giftRecipientUid!,
          ...(giftRecipientDisplayName
            ? { recipientDisplayName: giftRecipientDisplayName }
            : {}),
          ...(appUser?.displayName
            ? { senderDisplayName: appUser.displayName }
            : {}),
          ...(giftMessage ? { giftMessage } : {}),
          isAutoBuy: false,
        });

        await Promise.all(
          cart.items.map((item) => incrementSalesCount(item.id, item.quantity)),
        );
        await saveUserCart(firebaseUser.uid, []);
        dispatch(clearCart());
        router.push(`/order-confirmation/${orderId}?from=checkout`);
      } else {
        // Personal + gift order scenario (creates two separate orders)
        const personalOrderItems = buildOrderItems(personalItems);
        const giftOrderItems = buildOrderItems(giftItems);
        const { totalAmount: pAmount, totalCost: pCost } =
          sumItems(personalOrderItems);
        const { totalAmount: gAmount, totalCost: gCost } =
          sumItems(giftOrderItems);

        const [personalOrderId, giftOrderId] = await Promise.all([
          createOrder({
            userId: firebaseUser.uid,
            items: personalOrderItems,
            totalAmount: Math.round(pAmount),
            totalCost: Math.round(pCost),
            shippingAddress: shippingAddr,
            paymentType,
            status: "complete",
            isGift: false,
            isAutoBuy: false,
          }),
          createOrder({
            userId: firebaseUser.uid,
            items: giftOrderItems,
            totalAmount: Math.round(gAmount),
            totalCost: Math.round(gCost),
            paymentType,
            status: "pending",
            isGift: true,
            giftRecipientId: giftRecipientUid!,
            ...(giftRecipientDisplayName
              ? { recipientDisplayName: giftRecipientDisplayName }
              : {}),
            ...(appUser?.displayName
              ? { senderDisplayName: appUser.displayName }
              : {}),
            ...(giftMessage ? { giftMessage } : {}),
            isAutoBuy: false,
          }),
        ]);

        await Promise.all(
          cart.items.map((item) => incrementSalesCount(item.id, item.quantity)),
        );
        await saveUserCart(firebaseUser.uid, []);
        dispatch(clearCart());
        router.push(
          `/order-confirmation/${personalOrderId}?giftOrderId=${giftOrderId}&from=checkout`,
        );
      }
    } catch (err: any) {
      console.error("Failed to place order:", err);
      setPlaceError(err?.message || "Something went wrong. Please try again.");
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

  if (placing) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-black/10 border-t-black animate-spin" />
        <p className="text-base font-medium text-black/60">
          Placing your order…
        </p>
      </main>
    );
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
            {/* Step indicator */}
            <StepIndicator steps={steps} currentStepIndex={currentStepIndex} />
            {/* Step content */}
            <div className="min-h-[300px]">
              {currentStep === "address" && (
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
                    className="mt-6 w-full bg-black text-white rounded-full py-3.5 px-4 font-medium hover:bg-black/80 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}

              {currentStep === "gift-details" && (
                <GiftDetailsStep
                  friends={friends}
                  friendsLoading={friendsLoading}
                  selectedUid={giftRecipientUid}
                  message={giftMessage}
                  error={giftError}
                  onRecipientSelect={(uid, name) => {
                    setGiftRecipientUid(uid);
                    setGiftRecipientDisplayName(name);
                    if (giftError) setGiftError("");
                  }}
                  onMessageChange={setGiftMessage}
                  onBack={() => setCurrentStepIndex((i) => i - 1)}
                  onContinue={handleGiftDetailsContinue}
                  showBack={currentStepIndex > 0}
                />
              )}

              {currentStep === "payment" && (
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
                      onClick={() => setCurrentStepIndex((i) => i - 1)}
                      className="flex-1 border border-black/10 text-black rounded-full py-3.5 px-4 font-medium hover:bg-black/5 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePaymentContinue}
                      className="flex-1 bg-black text-white rounded-full py-3.5 px-4 font-medium hover:bg-black/80 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {currentStep === "review" && (
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
                          onClick={() =>
                            setCurrentStepIndex(steps.indexOf("address"))
                          }
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

                  {/* Gift recipient summary */}
                  {giftItems.length > 0 && giftRecipientDisplayName && (
                    <div className="border border-black/10 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FiGift className="text-black/60" />
                          <span className="text-sm font-semibold">
                            {scenario === "mixed"
                              ? "Gift Details"
                              : "Gift Details"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentStepIndex(steps.indexOf("gift-details"))
                          }
                          className="flex items-center gap-1 text-xs text-black/50 hover:text-black transition-colors"
                        >
                          <FiEdit2 className="text-xs" />
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-black/70">
                        To: {giftRecipientDisplayName}
                      </p>
                      {giftMessage && (
                        <p className="text-xs text-black/50 mt-1 italic">
                          &ldquo;{giftMessage}&rdquo;
                        </p>
                      )}
                      <div className="mt-2 bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-2">
                        Recipient will provide their address when they accept
                        the gift.
                      </div>
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
                          onClick={() =>
                            setCurrentStepIndex(steps.indexOf("payment"))
                          }
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
                      {scenario === "mixed" ? (
                        <>
                          {/* Personal items */}
                          {personalItems.length > 0 && (
                            <div className="mb-4">
                              <span className="text-xs font-semibold uppercase tracking-wide text-black/40 block mb-2">
                                Personal Items
                              </span>
                              <div className="flex flex-col gap-3">
                                {personalItems.map((item) => {
                                  const discounted = calcDiscountedPrice(
                                    item.price,
                                    item.discount,
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
                                        {formatPrice(
                                          discounted * item.quantity,
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <hr className="border-t-black/10 mb-4" />
                          {/* Gift items */}
                          {giftItems.length > 0 && (
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wide text-black/40 block mb-2">
                                Gift Items
                              </span>
                              <div className="flex flex-col gap-3">
                                {giftItems.map((item) => {
                                  const discounted = calcDiscountedPrice(
                                    item.price,
                                    item.discount,
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
                                        {formatPrice(
                                          discounted * item.quantity,
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold block mb-3">
                            Items ({cart.totalQuantities})
                          </span>
                          <div className="flex flex-col gap-3">
                            {cart.items.map((item) => {
                              const discounted = calcDiscountedPrice(
                                item.price,
                                item.discount,
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
                        </>
                      )}
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
                      onClick={() => setCurrentStepIndex((i) => i - 1)}
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
