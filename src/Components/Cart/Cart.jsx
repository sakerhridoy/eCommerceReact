import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../contexts/ShopContext';
import { validateCoupon } from '../../api/catalog';
import SEO from '../SEO';
import {
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
} from 'react-icons/md';
import { IoMdCloseCircle } from 'react-icons/io';

const Cart = () => {
  const {
    cart,
    selectedItems,
    selectedSubtotal,
    toggleSelection,
    selectAll,
    deselectAll,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
  } = useShop();

  const navigate = useNavigate();
  const shippingCost = 0;

  // Checkout calculation based on selected items only
  const subtotal = selectedSubtotal;

  const [couponCode, setCouponCode] = useState(
    () => localStorage.getItem('appliedCoupon') || '',
  );
  const [discountAmount, setDiscountAmount] = useState(
    () => Number(localStorage.getItem('couponDiscount')) || 0,
  );
  const [appliedCoupon, setAppliedCoupon] = useState(
    () => localStorage.getItem('appliedCoupon') || null,
  );
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Total is now dependent on selected items
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const getItemPrice = item =>
    item.discountPrice ?? item.dPrice ?? item.price ?? 0;
  const getItemImage = item => item.img || item.thumbnail || item.image || '';
  const getItemName = item => item.name || item.title || 'Product';
  const getItemId = item => item.id || item.cartItemId || item._id;

  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: 'error', text: 'Please enter a coupon code.' });
      return;
    }

    if (selectedItems.length === 0) {
      setCouponMessage({
        type: 'error',
        text: 'Select at least one product to apply coupon.',
      });
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage({ type: '', text: '' });

    try {
      // Validate coupon based on SELECTED items only
      const selectedCartItems = cart.filter(item =>
        selectedItems.includes(getItemId(item)),
      );
      const cartItemsForValidation = selectedCartItems.map(item => ({
        product: getItemId(item),
        quantity: item.quantity || 1,
        price: getItemPrice(item),
      }));

      const res = await validateCoupon(
        couponCode.trim().toUpperCase(),
        subtotal,
        cartItemsForValidation,
      );

      const responseData = res?.data || res;
      const discountVal = Number(
        responseData.discount ??
          responseData.discountAmount ??
          responseData.amount ??
          0,
      );

      if (discountVal <= 0) {
        throw new Error('This coupon offers no discount or is not applicable.');
      }

      setDiscountAmount(discountVal);
      const codeToApply = couponCode.trim().toUpperCase();
      setAppliedCoupon(codeToApply);

      localStorage.setItem('appliedCoupon', codeToApply);
      localStorage.setItem('couponDiscount', discountVal);

      setCouponMessage({
        type: 'success',
        text: `Coupon applied successfully!`,
      });
    } catch (error) {
      setDiscountAmount(0);
      setAppliedCoupon(null);
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('couponDiscount');

      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Invalid or expired coupon';

      setCouponMessage({
        type: 'error',
        text: errorMsg,
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('couponDiscount');
    setCouponMessage({ type: 'success', text: 'Coupon removed successfully.' });
  };

  return (
    <section className="pb-35 pt-10">
      <SEO title="Shopping Cart" noIndex />
      <div className="container px-4 xl:px-0">
        <div className="py-10">
          <p className="font-poppins font-normal text-sm text-black/50">
            <Link to="/">Home</Link> / <span className="text-black">Cart</span>
          </p>
        </div>

        {/* Header containing Select All */}
        <div className="hidden md:flex justify-between items-center shadow-sm py-4 px-10 select-none mb-10 rounded-sm">
          <div className="w-1/4 flex items-center gap-4">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAllToggle}
              className="w-5 h-5 accent-[#DB4444] cursor-pointer"
            />
            <h3 className="text-base font-poppins font-normal leading-6 text-black">
              Product
            </h3>
          </div>
          <div className="flex justify-between w-[70%]">
            <h3 className="text-base font-poppins font-normal leading-6 text-black">
              Price
            </h3>
            <h3 className="text-base font-poppins font-normal leading-6 text-black">
              Quantity
            </h3>
            <h3 className="text-base font-poppins font-normal leading-6 text-black">
              Subtotal
            </h3>
          </div>
        </div>

        {cart.length === 0 ? (
          <p className="text-center py-10 text-black/50">Your cart is empty.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {cart.map(item => {
              const id = getItemId(item);
              const isSelected = selectedItems.includes(id);

              return (
                <div
                  key={id}
                  className={`flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm py-4 px-6 md:px-10 select-none rounded-sm transition-colors ${
                    isSelected ? 'bg-white' : 'bg-gray-50 opacity-70'
                  }`}
                >
                  <div className="flex w-full md:w-1/4 items-center gap-4 relative group">
                    {/* Item Select Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(id)}
                      className="w-5 h-5 accent-[#DB4444] cursor-pointer"
                    />

                    <div className="relative">
                      <img
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                        className="w-16 transition-transform duration-300 group-hover:translate-x-2"
                      />
                      <IoMdCloseCircle
                        onClick={() => removeFromCart(id)}
                        className="text-[#db4444] absolute top-0.5 -left-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full"
                      />
                    </div>

                    <span className="text-sm font-poppins font-normal leading-6 text-black">
                      {getItemName(item)}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between w-full md:w-[70%] mt-4 md:mt-0 items-start md:items-center gap-4 md:gap-6">
                    <div className="text-base font-poppins font-normal leading-6 text-black">
                      ৳{getItemPrice(item)}
                    </div>
                    <div className="flex items-center border rounded-sm py-1.5 px-3 gap-2 border-black/40">
                      <span className="ml-2">{item.quantity}</span>
                      <div className="flex flex-col items-center cursor-pointer">
                        <MdOutlineKeyboardArrowUp
                          onClick={() => incrementQuantity(id)}
                        />
                        <MdOutlineKeyboardArrowDown
                          onClick={() => decrementQuantity(id)}
                        />
                      </div>
                    </div>
                    <div className="text-base font-poppins font-normal leading-6 text-black text-end">
                      ৳{getItemPrice(item) * (item.quantity || 1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between gap-10 mt-12">
          <div className="flex flex-col gap-6 w-full lg:w-1/2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Link
                to="/shop"
                className="px-12 py-4 bg-transparent border border-black/50 text-black font-poppins font-medium text-base rounded-sm w-full sm:w-auto text-center"
              >
                Return To Shop
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="px-12 py-4 bg-transparent border border-black/50 text-black font-poppins font-medium text-base rounded-sm w-full sm:w-auto hover:bg-gray-100"
              >
                Clear Cart
              </button>
            </div>

            {cart.length > 0 && (
              <div className="mt-4 p-6 border border-gray-200 rounded-sm bg-gray-50/50">
                <h4 className="font-poppins font-medium text-base text-black mb-3">
                  Have a Coupon?
                </h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    disabled={Boolean(appliedCoupon)}
                    placeholder="Enter Coupon Code"
                    className="flex-1 border border-black/30 bg-white text-black rounded-sm font-poppins font-medium text-base py-3 px-4 outline-0 uppercase disabled:opacity-50"
                  />
                  {!appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || selectedItems.length === 0}
                      className="bg-[#DB4444] text-white py-3 px-6 rounded-sm font-poppins font-medium text-base hover:bg-red-600 transition-colors disabled:opacity-50"
                      title={
                        selectedItems.length === 0 ? 'Select an item first' : ''
                      }
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply Coupon'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="bg-gray-800 text-white py-3 px-6 rounded-sm font-poppins font-medium text-base hover:bg-black transition-colors"
                    >
                      Remove Coupon
                    </button>
                  )}
                </div>
                {couponMessage.text && (
                  <div
                    className={`p-3 rounded-sm text-sm mt-3 ${couponMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}
                  >
                    {couponMessage.text}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full lg:w-[35%]">
            {cart.length > 0 && (
              <div className="border py-8 px-6 border-black rounded-sm">
                <h3 className="font-poppins font-medium text-xl text-black leading-7 pb-6">
                  Cart Total
                </h3>
                <div className="flex justify-between mb-4 pb-4 border-b border-black/40">
                  <span className="font-poppins font-normal text-base text-black">
                    Selected Items ({selectedItems.length}):
                  </span>
                  <span className="font-poppins font-normal text-base text-black">
                    ৳{subtotal.toFixed(2)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between mb-4 pb-4 border-b border-black/40 text-green-600 font-medium">
                    <span className="font-poppins text-base">
                      Discount ({appliedCoupon}):
                    </span>
                    <span>-৳{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-4 pb-4 border-b border-black/40">
                  <span className="font-poppins font-normal text-base text-black">
                    Shipping:
                  </span>
                  <span className="font-poppins font-normal text-base text-black">
                    ৳{shippingCost}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span className="font-poppins font-normal text-base text-black">
                    Total
                  </span>
                  <span className="font-poppins font-normal text-base text-black">
                    ৳{total.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  disabled={selectedItems.length === 0}
                  className="w-full py-4 bg-[#DB4444] text-[#fafafa] font-poppins font-medium text-base rounded-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;