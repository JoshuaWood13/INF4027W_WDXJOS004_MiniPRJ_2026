import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase/firestore";
import { createOrder } from "@/lib/firestore/orders";
import { getUsersWithProductWatcher, removePriceWatcher, addAutoBuyMessage } from "@/lib/firestore/users";
import { calcDiscountedPrice } from "@/lib/utils";
import { Discount } from "@/types/product.types";

// Type to pass required data for triggering watchers when a product price changes
type TriggerBody = {
  productId: string;
  productName: string;
  newPrice: number;
  newDiscount: Discount;
};

// Auto-buy product, removes the watcher, and add an activity message when a watcher's target price is met (Called when admin updates product a product's price)
export async function POST(request: NextRequest) {
  try {
    const body: TriggerBody = await request.json();
    const { productId, productName, newPrice, newDiscount } = body;

    if (!productId || !productName || newPrice == null || !newDiscount) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: productId, productName, newPrice, newDiscount",
        },
        { status: 400 },
      );
    }

    const effectivePrice = calcDiscountedPrice(newPrice, newDiscount);

    // Get all users with a watcher for this product
    const usersWithWatcher = await getUsersWithProductWatcher(productId);

    let triggered = 0;

    for (const user of usersWithWatcher) {
      const watcher = user.priceWatchers.find((w) => w.productId === productId);
      if (!watcher) continue;

      // Only trigger if effective price is at or below the watcher target
      if (effectivePrice > watcher.targetPrice) continue;

      try {
        // Create the auto-buy order
        const orderId = await createOrder({
          userId: user.uid,
          items: [
            {
              productId,
              name: productName,
              price: effectivePrice,
              quantity: 1,
              image: "",
            },
          ],
          totalAmount: effectivePrice,
          totalCost: effectivePrice,
          shippingAddress: watcher.address,
          paymentType: watcher.paymentType,
          status: "complete",
          isGift: false,
          isAutoBuy: true,
        });

        // Remove the watcher
        await removePriceWatcher(user.uid, watcher);

        // Add activity message
        await addAutoBuyMessage(user.uid, {
          id: crypto.randomUUID(),
          productName,
          pricePaid: effectivePrice,
          orderId,
          createdAt: Timestamp.now(),
        });

        triggered++;
      } catch (userError) {
        console.error(`Auto-buy failed for user ${user.uid}:`, userError);
      }
    }

    return NextResponse.json({ triggered });
  } catch (error) {
    console.error("Watcher trigger error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
