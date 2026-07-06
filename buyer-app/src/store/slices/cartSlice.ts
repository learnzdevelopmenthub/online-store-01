import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string;
}

interface CartState {
  items: CartItem[];
  open: boolean;
}

const initialState: CartState = {
  items: [],
  open: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const exists = state.items.some((item) => item.bookId === action.payload.bookId);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.bookId !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    openCart: (state) => {
      state.open = true;
    },
    closeCart: (state) => {
      state.open = false;
    },
  },
});

export const { addToCart, removeFromCart, clearCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
