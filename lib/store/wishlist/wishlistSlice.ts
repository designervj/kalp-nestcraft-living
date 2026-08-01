import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistItem {
  id: string;
  title: string;
  price: string;
  img: string;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('wishlist') || '[]') : [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        if (typeof window !== 'undefined') {
          localStorage.setItem('wishlist', JSON.stringify(state.items));
        }
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      }
    },
    clearWishlist: (state) => {
      state.items = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wishlist');
      }
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
