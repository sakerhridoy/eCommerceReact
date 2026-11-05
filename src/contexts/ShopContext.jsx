import { createContext, useContext, useEffect, useRef, useState } from 'react';
import useShopStore from '../store/cartStore';
import api from '../api/client';
import { normalizeProduct } from '../api/catalog';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const cart = useShopStore(state => state.cart);
  const cartSubtotal = useShopStore(state => state.cartSubtotal); // Original Subtotal (for all items)
  const wishlist = useShopStore(state => state.wishlist);
  const [cartError, setCartError] = useState('');
  const previousUserId = useRef(null);
  const setCart = useShopStore(state => state.replaceCart);
  const addGuestItem = useShopStore(state => state.addToCart);
  const addToWishlist = useShopStore(state => state.addToWishlist);
  const incrementGuestQuantity = useShopStore(state => state.incrementQuantity);
  const decrementGuestQuantity = useShopStore(state => state.decrementQuantity);
  const removeGuestItem = useShopStore(state => state.removeFromCart);
  const removeFromWishlist = useShopStore(state => state.removeFromWishlist);

  // Global Coupon States (Synced with LocalStorage for persistence)
  const [appliedCoupon, setAppliedCoupon] = useState(
    () => localStorage.getItem('appliedCoupon') || null,
  );
  const [discountAmount, setDiscountAmount] = useState(
    () => Number(localStorage.getItem('couponDiscount')) || 0,
  );

  // ==========================================
  // PHASE 2: ADVANCED CART SELECTION STATE
  // ==========================================
  const [selectedItems, setSelectedItems] = useState([]);
  const prevCartRef = useRef([]);

  const getItemId = item => item.id || item.cartItemId || item._id;
  const getItemPrice = item =>
    item.discountPrice ?? item.dPrice ?? item.price ?? 0;

  // Sync selection state with cart changes
  useEffect(() => {
    const prevCart = prevCartRef.current;
    const currentCartIds = cart.map(getItemId);

    // Identify newly added items to auto-select them
    const newItems = cart.filter(
      item => !prevCart.some(p => getItemId(p) === getItemId(item)),
    );

    if (newItems.length > 0 || cart.length !== prevCart.length) {
      setSelectedItems(prev => {
        // Remove IDs that are no longer in the cart
        const validSelections = prev.filter(id => currentCartIds.includes(id));
        // Add new item IDs to the selection
        const newIds = newItems.map(getItemId);
        return [...new Set([...validSelections, ...newIds])]; // Use Set to prevent duplicates
      });
    }
    prevCartRef.current = cart;
  }, [cart]);

  const toggleSelection = id => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id],
    );
  };

  const selectAll = () => setSelectedItems(cart.map(getItemId));
  const deselectAll = () => setSelectedItems([]);

  // Calculate subtotal ONLY for selected items
  const selectedSubtotal = cart
    .filter(item => selectedItems.includes(getItemId(item)))
    .reduce(
      (total, item) => total + getItemPrice(item) * (item.quantity || 1),
      0,
    );
  // ==========================================

  const applyServerCart = serverCart => {
    const items = (serverCart.items || [])
      .filter(item => item.product)
      .map(item => ({
        ...normalizeProduct(item.product),
        cartItemId: item._id,
        quantity: item.quantity,
        variant: item.variant,
      }));
    setCart(items);
  };

  const reportCartError = error => {
    console.error('Cart request failed:', error);
    setCartError(
      error.response?.data?.message ||
        'Could not update your cart. Please try again.',
    );
  };

  useEffect(() => {
    const userId = user?._id;
    if (!userId) {
      if (previousUserId.current) setCart([]);
      previousUserId.current = null;
      return undefined;
    }

    previousUserId.current = userId;
    let active = true;

    const loadCart = async () => {
      try {
        const serverResponse = await api.get('/cart');
        const guestItems = useShopStore
          .getState()
          .cart.filter(item => !item.cartItemId);
        let syncError = null;

        for (const item of guestItems) {
          try {
            await api.post('/cart', {
              productId: item._id || item.id,
              quantity: item.quantity || 1,
              variant: item.variant,
            });
          } catch (error) {
            syncError = error;
            console.error('Could not migrate a guest cart item:', error);
          }
        }

        const { data } = guestItems.length
          ? await api.get('/cart')
          : serverResponse;
        if (active) {
          applyServerCart(data.data);
          if (syncError) reportCartError(syncError);
          else setCartError('');
        }
      } catch (error) {
        if (active) reportCartError(error);
      }
    };

    loadCart();
    return () => {
      active = false;
    };
  }, [user?._id]);

  // Global Coupon Handlers
  const saveCoupon = (code, discount) => {
    setAppliedCoupon(code);
    setDiscountAmount(discount);
    localStorage.setItem('appliedCoupon', code);
    localStorage.setItem('couponDiscount', discount);
  };

  const removeGlobalCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('couponDiscount');
  };

  const addToCart = async product => {
    if (!user) {
      addGuestItem(product);
      return true;
    }

    try {
      const { data } = await api.post('/cart', {
        productId: product._id || product.id,
        quantity: product.quantity || 1,
        variant:
          product.variant ||
          (product.color || product.size
            ? { color: product.color, size: product.size }
            : undefined),
      });
      applyServerCart(data.data);
      setCartError('');
      return true;
    } catch (error) {
      reportCartError(error);
      return false;
    }
  };

  const updateCartItem = async (id, quantity) => {
    if (!user) {
      if (quantity > 0) {
        const item = cart.find(cartItem => cartItem.id === id);
        const currentQuantity = item?.quantity || 1;
        if (quantity > currentQuantity) incrementGuestQuantity(id);
        else decrementGuestQuantity(id);
      } else {
        removeGuestItem(id);
      }
      return;
    }

    const item = cart.find(cartItem => cartItem.id === id);
    if (!item?.cartItemId) return;

    try {
      const { data } = await api.put(`/cart/items/${item.cartItemId}`, {
        quantity,
      });
      applyServerCart(data.data);
      setCartError('');
    } catch (error) {
      reportCartError(error);
    }
  };

  const incrementQuantity = id => {
    const item = cart.find(cartItem => cartItem.id === id);
    return updateCartItem(id, (item?.quantity || 1) + 1);
  };

  const decrementQuantity = id => {
    const item = cart.find(cartItem => cartItem.id === id);
    return updateCartItem(id, Math.max((item?.quantity || 1) - 1, 1));
  };

  const removeFromCart = async id => {
    if (!user) {
      removeGuestItem(id);
      return;
    }

    const item = cart.find(cartItem => cartItem.id === id);
    if (!item?.cartItemId) return;

    try {
      const { data } = await api.delete(`/cart/items/${item.cartItemId}`);
      applyServerCart(data.data);
      setCartError('');
    } catch (error) {
      reportCartError(error);
    }
  };

  const clearCart = async () => {
    removeGlobalCoupon();
    if (!user) {
      setCart([]);
      return;
    }

    try {
      const { data } = await api.delete('/cart');
      applyServerCart(data.data);
      setCartError('');
    } catch (error) {
      reportCartError(error);
    }
  };

  const clearLocalCart = () => {
    setCart([]);
    removeGlobalCoupon();
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        cartSubtotal, // All items total
        wishlist,
        appliedCoupon,
        discountAmount,

        // Advanced Cart Variables
        selectedItems,
        selectedSubtotal,

        // Functions
        saveCoupon,
        removeGlobalCoupon,
        addToCart,
        addToWishlist,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        removeFromWishlist,
        clearCart,
        clearLocalCart,
        toggleSelection,
        selectAll,
        deselectAll,
      }}
    >
      {cartError && (
        <p
          className="fixed bottom-4 right-4 z-[100] max-w-sm rounded bg-red-700 px-4 py-3 text-white shadow-lg"
          role="alert"
        >
          {cartError}
        </p>
      )}
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
