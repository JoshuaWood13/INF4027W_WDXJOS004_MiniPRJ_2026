import { compareArrays } from "@/lib/utils";
import { Discount } from "@/types/product.types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const calcAdjustedTotalPrice = (
  totalPrice: number,
  data: CartItem,
  quantity?: number,
): number => {
  return (
    (totalPrice + data.discount.percentage > 0
      ? Math.round(data.price - (data.price * data.discount.percentage) / 100)
      : data.discount.amount > 0
        ? Math.round(data.price - data.discount.amount)
        : data.price) * (quantity ? quantity : data.quantity)
  );
};

export type RemoveCartItem = {
  id: string;
  attributes: string[];
};

export type CartItem = {
  id: string;
  name: string;
  srcUrl: string;
  price: number;
  attributes: string[]; 
  discount: Discount;
  quantity: number;
  itemType?: "personal" | "gift"; // default: "personal"
};

export type Cart = {
  items: CartItem[];
  totalQuantities: number;
};

// Define a type for the slice state
interface CartsState {
  cart: Cart | null;
  totalPrice: number;
  adjustedTotalPrice: number;
  action: "update" | "add" | "delete" | null;
}

// Define the initial state using that type
const initialState: CartsState = {
  cart: null,
  totalPrice: 0,
  adjustedTotalPrice: 0,
  action: null,
};

export const cartsSlice = createSlice({
  name: "carts",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      // Ensure itemType defaults to "personal"
      const payload: CartItem = {
        ...action.payload,
        itemType: action.payload.itemType ?? "personal",
      };
      // if cart is empty then add
      if (state.cart === null) {
        state.cart = {
          items: [payload],
          totalQuantities: payload.quantity,
        };
        state.totalPrice = state.totalPrice + payload.price * payload.quantity;
        state.adjustedTotalPrice =
          state.adjustedTotalPrice +
          calcAdjustedTotalPrice(state.totalPrice, payload);
        return;
      }

      // check item in cart 
      const isItemInCart = state.cart.items.find(
        (item) =>
          payload.id === item.id &&
          compareArrays(payload.attributes, item.attributes),
      );

      if (isItemInCart) {
        state.cart = {
          ...state.cart,
          items: state.cart.items.map((eachCartItem) => {
            if (
              eachCartItem.id === payload.id
                ? !compareArrays(
                    eachCartItem.attributes,
                    isItemInCart.attributes,
                  )
                : eachCartItem.id !== payload.id
            )
              return eachCartItem;

            return {
              ...isItemInCart,
              quantity: payload.quantity + isItemInCart.quantity,
            };
          }),
          totalQuantities: state.cart.totalQuantities + payload.quantity,
        };
        state.totalPrice = state.totalPrice + payload.price * payload.quantity;
        state.adjustedTotalPrice =
          state.adjustedTotalPrice +
          calcAdjustedTotalPrice(state.totalPrice, payload);
        return;
      }

      state.cart = {
        ...state.cart,
        items: [...state.cart.items, payload],
        totalQuantities: state.cart.totalQuantities + payload.quantity,
      };
      state.totalPrice = state.totalPrice + payload.price * payload.quantity;
      state.adjustedTotalPrice =
        state.adjustedTotalPrice +
        calcAdjustedTotalPrice(state.totalPrice, payload);
    },
    removeCartItem: (state, action: PayloadAction<RemoveCartItem>) => {
      if (state.cart === null) return;

      const isItemInCart = state.cart.items.find(
        (item) =>
          action.payload.id === item.id &&
          compareArrays(action.payload.attributes, item.attributes),
      );

      if (isItemInCart) {
        state.cart = {
          ...state.cart,
          items: state.cart.items
            .map((eachCartItem) => {
              if (
                eachCartItem.id === action.payload.id
                  ? !compareArrays(
                      eachCartItem.attributes,
                      isItemInCart.attributes,
                    )
                  : eachCartItem.id !== action.payload.id
              )
                return eachCartItem;

              return {
                ...isItemInCart,
                quantity: eachCartItem.quantity - 1,
              };
            })
            .filter((item) => item.quantity > 0),
          totalQuantities: state.cart.totalQuantities - 1,
        };

        state.totalPrice = state.totalPrice - isItemInCart.price * 1;
        state.adjustedTotalPrice =
          state.adjustedTotalPrice -
          calcAdjustedTotalPrice(isItemInCart.price, isItemInCart, 1);
      }
    },
    remove: (
      state,
      action: PayloadAction<RemoveCartItem & { quantity: number }>,
    ) => {
      if (!state.cart) return;

      const isItemInCart = state.cart.items.find(
        (item) =>
          action.payload.id === item.id &&
          compareArrays(action.payload.attributes, item.attributes),
      );

      if (!isItemInCart) return;

      state.cart = {
        ...state.cart,
        items: state.cart.items.filter((pItem) => {
          return pItem.id === action.payload.id
            ? !compareArrays(pItem.attributes, isItemInCart.attributes)
            : pItem.id !== action.payload.id;
        }),
        totalQuantities: state.cart.totalQuantities - isItemInCart.quantity,
      };
      state.totalPrice =
        state.totalPrice - isItemInCart.price * isItemInCart.quantity;
      state.adjustedTotalPrice =
        state.adjustedTotalPrice -
        calcAdjustedTotalPrice(
          isItemInCart.price,
          isItemInCart,
          isItemInCart.quantity,
        );
    },
    /** Clear the entire cart (used after checkout or manual clear) */
    clearCart: (state) => {
      state.cart = null;
      state.totalPrice = 0;
      state.adjustedTotalPrice = 0;
      state.action = null;
    },
    /** Update the itemType of a specific cart item in-place */
    setCartItemType: (
      state,
      action: PayloadAction<{
        id: string;
        attributes: string[];
        itemType: "personal" | "gift";
      }>,
    ) => {
      if (!state.cart) return;
      const item = state.cart.items.find(
        (i) =>
          i.id === action.payload.id &&
          compareArrays(i.attributes, action.payload.attributes),
      );
      if (item) {
        item.itemType = action.payload.itemType;
      }
    },
    /** Merge items from Firestore into the current cart (used on login) */
    mergeCartItems: (state, action: PayloadAction<CartItem[]>) => {
      const incomingItems = action.payload.map((item) => ({
        ...item,
        itemType: item.itemType ?? "personal",
      }));
      if (incomingItems.length === 0) return;

      // If cart is empty, set it directly
      if (!state.cart || state.cart.items.length === 0) {
        let totalQty = 0;
        let totalP = 0;
        let adjustedP = 0;

        for (const item of incomingItems) {
          totalQty += item.quantity;
          totalP += item.price * item.quantity;
          adjustedP += calcAdjustedTotalPrice(0, item);
        }

        state.cart = { items: incomingItems, totalQuantities: totalQty };
        state.totalPrice = totalP;
        state.adjustedTotalPrice = adjustedP;
        return;
      }

      // Merge: only add items not already present (by product id)
      for (const incoming of incomingItems) {
        const existsLocally = state.cart.items.find(
          (item) => item.id === incoming.id,
        );

        if (!existsLocally) {
          state.cart.items.push(incoming);
          state.cart.totalQuantities += incoming.quantity;
          state.totalPrice += incoming.price * incoming.quantity;
          state.adjustedTotalPrice += calcAdjustedTotalPrice(0, incoming);
        }
      }
    },
  },
});

export const {
  addToCart,
  removeCartItem,
  remove,
  clearCart,
  mergeCartItems,
  setCartItemType,
} = cartsSlice.actions;

export default cartsSlice.reducer;
