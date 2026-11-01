import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getItemPrice = item =>
  item?.discountPrice ?? item?.dPrice ?? item?.price ?? 0;

const computeCartDerived = cart => ({
  cartCount: cart.reduce((total, item) => total + (item.quantity || 1), 0),
  cartSubtotal: cart.reduce(
    (total, item) => total + getItemPrice(item) * (item.quantity || 1),
    0,
  ),
});

const computeWishlistDerived = wishlist => ({
  wishlistCount: wishlist.length,
});

const useShopStore = create(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      cartCount: 0,
      wishlistCount: 0,
      cartSubtotal: 0,

      recomputeDerived: () =>
        set(state => ({
          ...computeCartDerived(state.cart),
          ...computeWishlistDerived(state.wishlist),
        })),

      replaceCart: cart => set({ cart, ...computeCartDerived(cart) }),

      addToCart: product =>
        set(state => {
          const incomingQuantity = product?.quantity || 1;
          const exists = state.cart.find(p => p.id === product.id);

          const newCart = exists
            ? state.cart.map(p =>
                p.id === product.id
                  ? { ...p, quantity: (p.quantity || 1) + incomingQuantity }
                  : p,
              )
            : [...state.cart, { ...product, quantity: incomingQuantity }];

          return { cart: newCart, ...computeCartDerived(newCart) };
        }),

      removeFromCart: id =>
        set(state => {
          const newCart = state.cart.filter(item => item.id !== id);
          return { cart: newCart, ...computeCartDerived(newCart) };
        }),

      incrementQuantity: id =>
        set(state => {
          const newCart = state.cart.map(item =>
            item.id === id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item,
          );
          return { cart: newCart, ...computeCartDerived(newCart) };
        }),

      decrementQuantity: id =>
        set(state => {
          const newCart = state.cart.map(item =>
            item.id === id
              ? { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) }
              : item,
          );
          return { cart: newCart, ...computeCartDerived(newCart) };
        }),

      clearCart: () => set({ cart: [], cartCount: 0, cartSubtotal: 0 }),

      addToWishlist: product =>
        set(state => {
          const exists = state.wishlist.some(w => w.id === product.id);
          const newWishlist = exists
            ? state.wishlist
            : [...state.wishlist, product];
          return {
            wishlist: newWishlist,
            ...computeWishlistDerived(newWishlist),
          };
        }),

      removeFromWishlist: id =>
        set(state => {
          const newWishlist = state.wishlist.filter(item => item.id !== id);
          return {
            wishlist: newWishlist,
            ...computeWishlistDerived(newWishlist),
          };
        }),

      isInCart: id => get().cart.some(item => item.id === id),
      isInWishlist: id => get().wishlist.some(item => item.id === id),
    }),
    {
      name: 'shop-storage',
      partialize: state => ({ cart: state.cart, wishlist: state.wishlist }),
      onRehydrateStorage: () => state => {
        state?.recomputeDerived?.();
      },
    },
  ),
);

export default useShopStore;
