import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductFormState } from "../products/productsSlices";
import { VariantRow, composeVariantKey } from "@/lib/admin-products/utils";
import {
  fetchCart,
  addToCartAsync,
  updateQuantityAsync,
  removeFromCartAsync,
  clearCartAsync,
} from "./cartThunk";


export interface CartItem extends ProductFormState {
  productId?: string;
  image?: string;
  currency?: string;
  unitPriceMinor?: number;
  quantity: number;
  selectedOptions: {
    [key: string]: string;
  };
  selectedVariant: VariantRow;
  cartItemId?: string;
}

export interface CartState {
  id?: string;
  items: CartItem[];
  loading: boolean;
  error: string | null;
  hasCartFetched: boolean;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  hasCartFetched: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { _id, selectedOptions } = action.payload;
      const variantKey = composeVariantKey(selectedOptions || {});
      const cartItemId = `${_id}-${variantKey}`;

      const existingItem = state.items.find(
        (item) => item.cartItemId === cartItemId,
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push({ ...action.payload, cartItemId });
      }
      // saveToLocalStorage(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.cartItemId !== action.payload,
      );
      // saveToLocalStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>,
    ) => {
      const { cartItemId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(
          (item) => item.cartItemId !== cartItemId,
        );
      } else {
        const item = state.items.find((item) => item.cartItemId === cartItemId);
        if (item) {
          item.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.hasCartFetched = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.hasCartFetched = true;
      })
      // Add to Cart Async
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Quantity Async
      .addCase(updateQuantityAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(updateQuantityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Remove from Cart Async
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Clear Cart Async
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCart, addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total: number, item: CartItem) => {
    const selectedVariant = item.selectedVariant;
    if (selectedVariant && selectedVariant.price) {
      const price = Number(selectedVariant.price) || 0;
      return total + price * item.quantity;
    } else {
      // Remove currency symbols if present before converting to number
      const priceStr = item.price || item.pricing?.price || "0";
      const price = Number(priceStr) || 0;
      return total + price * item.quantity;
    }
  }, 0);

export const selectShippingCost = (state: { cart: CartState }) => {
  const total = selectCartTotal(state);
  return total > 0 ? Math.round(total * 0.05) : 0; // 5% dynamic shipping cost
};

export {
  fetchCart,
  addToCartAsync,
  updateQuantityAsync,
  removeFromCartAsync,
  clearCartAsync,
};

export default cartSlice.reducer;
