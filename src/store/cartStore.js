import { create } from 'zustand';

const useCartStore = create(set => ({
  cart: [],
  cartCount: 0,
  addToCart: product =>
    set(state => {
      const exists = state.cart.find(p => p.id === product.id);
      let newCart;
      if (exists) {
        newCart = state.cart.map(p =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p,
        );
      } else {
        newCart = [...state.cart, { ...product, quantity: 1 }];
      }
      return {
        cart: newCart,
        cartCount: newCart.reduce((acc, item) => acc + item.quantity, 0),
      };
    }),
}));

export default useCartStore;