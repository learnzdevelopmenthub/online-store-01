import { describe, expect, it } from 'vitest';

import cartReducer, {
  addToCart,
  removeFromCart,
  clearCart,
  openCart,
  closeCart,
  type CartItem,
} from '../src/store/slices/cartSlice.ts';

const item1: CartItem = {
  bookId: 'book-1',
  title: 'TypeScript Deep Dive',
  author: 'Basarat Ali',
  price: 49900,
  coverImageUrl: 'https://cdn.example.com/covers/ts.webp',
};

const item2: CartItem = {
  bookId: 'book-2',
  title: 'Clean Code',
  author: 'Robert Martin',
  price: 39900,
  coverImageUrl: 'https://cdn.example.com/covers/cc.webp',
};

describe('cartSlice', () => {
  it('has empty cart by default', () => {
    const state = cartReducer(undefined, { type: '@@INIT' });
    expect(state.items).toEqual([]);
    expect(state.open).toBe(false);
  });

  describe('addToCart', () => {
    it('adds an item to the cart', () => {
      const state = cartReducer(undefined, addToCart(item1));
      expect(state.items).toHaveLength(1);
      expect(state.items[0]!.bookId).toBe('book-1');
    });

    it('does not add duplicate items', () => {
      let state = cartReducer(undefined, addToCart(item1));
      state = cartReducer(state, addToCart(item1));
      expect(state.items).toHaveLength(1);
    });

    it('allows adding multiple different items', () => {
      let state = cartReducer(undefined, addToCart(item1));
      state = cartReducer(state, addToCart(item2));
      expect(state.items).toHaveLength(2);
    });
  });

  describe('removeFromCart', () => {
    it('removes the specified item', () => {
      let state = cartReducer(undefined, addToCart(item1));
      state = cartReducer(state, addToCart(item2));
      state = cartReducer(state, removeFromCart('book-1'));
      expect(state.items).toHaveLength(1);
      expect(state.items[0]!.bookId).toBe('book-2');
    });

    it('is a no-op when item is not in cart', () => {
      let state = cartReducer(undefined, addToCart(item1));
      state = cartReducer(state, removeFromCart('book-999'));
      expect(state.items).toHaveLength(1);
    });
  });

  describe('clearCart', () => {
    it('empties the cart', () => {
      let state = cartReducer(undefined, addToCart(item1));
      state = cartReducer(state, addToCart(item2));
      state = cartReducer(state, clearCart());
      expect(state.items).toHaveLength(0);
    });
  });

  describe('openCart / closeCart', () => {
    it('opens the cart drawer', () => {
      const state = cartReducer(undefined, openCart());
      expect(state.open).toBe(true);
    });

    it('closes the cart drawer', () => {
      let state = cartReducer(undefined, openCart());
      state = cartReducer(state, closeCart());
      expect(state.open).toBe(false);
    });
  });
});
