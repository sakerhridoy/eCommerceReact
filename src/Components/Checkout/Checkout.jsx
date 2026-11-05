import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/client';
import { validateCoupon, getMyAddresses } from '../../api/catalog';

import bkashImg from '../../assets/images/bkash.png';
import visaImg from '../../assets/images/visa.png';
import mcImg from '../../assets/images/mc.png';
import nagadImg from '../../assets/images/nagad.png';

const Checkout = () => {
  const {
    cart,
    selectedItems,
    selectedSubtotal,
    clearLocalCart,
    removeFromCart,
  } = useShop();
  const navigate = useNavigate();

  const shippingCost = 0;

  // Phase 2: Checkout uses ONLY selected items
  const subtotal = selectedSubtotal;

  const getItemId = item => item.id || item.cartItemId || item._id;

  // Filter cart to only show items that were selected in Cart page
  const checkoutItems = cart.filter(item =>
    selectedItems.includes(getItemId(item)),
  );

  // Redirect back to cart if nothing is selected
  useEffect(() => {
    if (checkoutItems.length === 0) {
      navigate('/cart');
    }
  }, [checkoutItems.length, navigate]);

  const [appliedCoupon, setAppliedCoupon] = useState(
    () => localStorage.getItem('appliedCoupon') || null,
  );
  const [discountAmount, setDiscountAmount] = useState(
    () => Number(localStorage.getItem('couponDiscount')) || 0,
  );

  const [couponInput, setCouponInput] = useState(
    () => localStorage.getItem('appliedCoupon') || '',
  );
  const [couponMessage, setCouponMessage] = useState({
    type: '',
    text: appliedCoupon ? `Coupon applied: ${appliedCoupon}` : '',
  });
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const getItemPrice = item =>
    item.discountPrice ?? item.dPrice ?? item.price ?? 0;
  const getItemImage = item => item.img || item.thumbnail || item.image || '';
  const getItemName = item => item.name || item.title || 'Product';

  const [form, setForm] = useState({
    firstName: '',
    companyName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    saveInfo: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  const applySavedAddress = address => {
    setSelectedAddressId(address._id);
    setForm(prev => ({
      ...prev,
      firstName: address.fullName || prev.firstName,
      address: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || '',
      phone: address.phone || prev.phone,
    }));
    setErrors({});
  };

  // Prefill the form with basic account info
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      firstName: prev.firstName || (user?.name || '').split(' ')[0] || '',
      email: prev.email || user?.email || '',
      phone: prev.phone || user?.phone || '',
    }));
  }, [user]);

  // Load saved addresses and prefill from the default one
  useEffect(() => {
    let active = true;

    const loadAddresses = async () => {
      try {
        const data = await getMyAddresses();
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setSavedAddresses(list);

        const preferred = list.find(address => address.isDefault) || list[0];
        if (preferred) {
          setSelectedAddressId(preferred._id);
          setForm(prev => ({
            ...prev,
            firstName: preferred.fullName || prev.firstName,
            address: preferred.street || '',
            city: preferred.city || '',
            state: preferred.state || '',
            zipCode: preferred.zipCode || '',
            country: preferred.country || '',
            phone: preferred.phone || prev.phone,
          }));
        }
      } catch {
        // No saved addresses available; the user can type manually.
      }
    };

    loadAddresses();
    return () => {
      active = false;
    };
  }, []);

  const validateField = (name, value) => {
    let error = '';
    if (
      [
        'firstName',
        'address',
        'city',
        'state',
        'zipCode',
        'country',
        'phone',
        'email',
      ].includes(name) &&
      !value.trim()
    ) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }
    if (
      name === 'phone' &&
      value &&
      !/^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/.test(value)
    ) {
      error = 'Invalid phone (use 01XXXXXXXXX or +8801XXXXXXXXX)';
    }
    if (
      name === 'email' &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      error = 'Invalid email format';
    }
    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    [
      'firstName',
      'address',
      'city',
      'state',
      'zipCode',
      'country',
      'phone',
      'email',
    ].forEach(field => {
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: inputValue }));

    if (['phone', 'email'].includes(name)) {
      const err = validateField(name, inputValue);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponMessage({ type: 'error', text: 'Please enter a coupon code.' });
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage({ type: '', text: '' });

    try {
      // Validate coupon against SELECTED items only
      const cartItemsForValidation = checkoutItems.map(item => ({
        product: getItemId(item),
        quantity: item.quantity || 1,
        price: getItemPrice(item),
      }));

      const res = await validateCoupon(
        couponInput.trim().toUpperCase(),
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
      const codeToApply = couponInput.trim().toUpperCase();
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
    setCouponInput('');
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('couponDiscount');
    setCouponMessage({ type: 'success', text: 'Coupon removed successfully.' });
  };

  const handlePlaceOrder = async e => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;
    if (!validateForm()) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      // Only send selected items in the order
      const cleanedItems = checkoutItems.map(item => {
        const orderItem = {
          product: getItemId(item),
          quantity: item.quantity || 1,
          price: getItemPrice(item),
        };
        if (item.variant && item.variant !== null && item.variant !== 'null') {
          orderItem.variant = item.variant;
        }
        return orderItem;
      });

      const { data } = await api.post('/orders', {
        items: cleanedItems,
        paymentMethod: paymentMethod === 'online' ? 'sslcommerz' : 'cod',
        couponCode: appliedCoupon || undefined,
        shippingAddress: {
          street: [form.address, form.apartment].filter(Boolean).join(', '),
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
          phone: form.phone,
        },
      });

      const order = data.data;

      // Clear applied coupon
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('couponDiscount');

      // ✅ FIX: Remove ONLY ordered items from the local cart state for BOTH payment methods
      for (const item of checkoutItems) {
        try {
          await removeFromCart(getItemId(item));
        } catch (err) {
          console.error('Cart cleanup error', err);
        }
      }

      if (paymentMethod === 'online') {
        const paymentRes = await api.post('/payments/create-session', {
          orderId: order._id || order.id,
        });

        const gatewayUrl =
          paymentRes.data?.data?.paymentUrl || paymentRes.data?.url;

        if (gatewayUrl) {
          // Local cart is already updated, safe to redirect
          window.location.href = gatewayUrl;
        } else {
          throw new Error('Payment gateway URL not received');
        }
      } else {
        // COD - Success
        const newOrderId = order.orderNumber || order._id || order.id;

        navigate(`/order-success?orderId=${newOrderId}`, {
          state: {
            orderNumber: order.orderNumber,
            total: Number(order.total).toFixed(2),
            paymentMethod: order.paymentMethod,
            orderStatus: order.orderStatus,
          },
        });
      }
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          'Could not place your order. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="pb-35 px-4 xl:px-0">
      <div className="container mx-auto">
        <div className="font-poppins font-normal text-sm text-black/50 py-8">
          Account / My Account / Product / View Cart /{' '}
          <span className="text-black">CheckOut</span>
        </div>

        <h2 className="font-inter font-medium text-4xl text-black leading-8 tracking-[4%] mb-12">
          Billing Details
        </h2>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-43.25">
          <form className="flex-1 space-y-4" onSubmit={handlePlaceOrder}>
            {savedAddresses.length > 0 && (
              <div className="mb-6">
                <h3 className="font-poppins font-medium text-lg text-black mb-3">
                  Saved Addresses
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map(address => (
                    <button
                      type="button"
                      key={address._id}
                      onClick={() => applySavedAddress(address)}
                      className={`text-left p-3 rounded-sm border transition-colors ${
                        selectedAddressId === address._id
                          ? 'border-[#DB4444] bg-red-50/40'
                          : 'border-gray-200 hover:border-[#DB4444]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm text-black">
                          {address.fullName || 'Saved Address'}
                        </span>
                        {address.isDefault && (
                          <span className="text-[10px] bg-red-100 text-[#DB4444] px-1.5 py-0.5 rounded font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {[
                          address.street,
                          address.city,
                          address.state,
                          address.zipCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p className="text-xs text-gray-600">{address.country}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {[
              { label: 'First Name', name: 'firstName', required: true },
              { label: 'Company Name', name: 'companyName', required: false },
              { label: 'Street Address', name: 'address', required: true },
              {
                label: 'Apartment, floor, etc. (optional)',
                name: 'apartment',
                required: false,
              },
              { label: 'Town/City', name: 'city', required: true },
              { label: 'State / Province', name: 'state', required: true },
              { label: 'ZIP / Postal Code', name: 'zipCode', required: true },
              { label: 'Country', name: 'country', required: true },
              { label: 'Phone Number', name: 'phone', required: true },
              { label: 'Email Address', name: 'email', required: true },
            ].map(field => (
              <div key={field.name} className="mb-8">
                <label className="block text-black/40 font-poppins font-normal text-base leading-6 mb-2">
                  {field.label}{' '}
                  {field.required && (
                    <span className="text-[rgba(219,68,68,0.4)]">*</span>
                  )}
                </label>
                <input
                  type={field.name === 'email' ? 'email' : 'text'}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full rounded-sm p-3 outline-0 bg-[#F5F5F5]"
                />
                {errors[field.name] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="saveInfo"
                checked={form.saveInfo}
                onChange={handleChange}
                className="w-4 h-4 text-[#DB4444] border-gray-300 rounded-sm"
              />
              <label className="font-poppins font-normal text-base text-black">
                Save this information for faster check-out next time
              </label>
            </div>
          </form>

          <div className="flex-1 space-y-4 mt-8 lg:mt-0">
            {checkoutItems.map((item, idx) => (
              <div
                key={getItemId(item) || idx}
                className="flex justify-between items-center bg-gray-50/50 p-2 rounded-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getItemImage(item)}
                    alt={getItemName(item)}
                    className="w-12 h-12 object-cover rounded-sm border border-gray-200"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {getItemName(item)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Qty: {item.quantity || 1}
                    </span>
                  </div>
                </div>
                <span className="font-medium">
                  ৳{(getItemPrice(item) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="flex justify-between pb-4 border-b border-black/40 mt-6">
              <span className="font-poppins font-normal text-base text-black">
                Subtotal:
              </span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between pb-4 border-b border-black/40 text-green-600 font-medium">
                <span className="font-poppins text-base">
                  Discount ({appliedCoupon}):
                </span>
                <span>-৳{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between pb-4 border-b border-black/40">
              <span className="font-poppins font-normal text-base text-black">
                Shipping:
              </span>
              <span>৳{shippingCost === 0 ? 'Free' : `${shippingCost}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pb-4">
              <span className="font-poppins font-normal text-base text-black">
                Total:
              </span>
              <span className="font-poppins font-normal text-base text-black">
                ৳{total.toFixed(2)}
              </span>
            </div>

            <div className="pt-4 pb-2 space-y-4 border-b border-black/40 pb-6">
              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-4 h-4 text-[#DB4444] accent-[#DB4444]"
                    />
                    <span className="font-poppins text-base text-black font-medium">
                      Pay Online (Secure Checkout)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={visaImg}
                      alt="VISA"
                      className="h-4 object-contain"
                    />
                    <img
                      src={bkashImg}
                      alt="bKash"
                      className="h-4 object-contain"
                    />
                    <img
                      src={nagadImg}
                      alt="Nagad"
                      className="h-4 object-contain"
                    />
                    <img
                      src={mcImg}
                      alt="MasterCard"
                      className="h-4 object-contain"
                    />
                  </div>
                </label>
                {paymentMethod === 'online' && (
                  <p className="ml-7 text-sm text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-200">
                    You will be securely redirected to our payment gateway to
                    complete your purchase.
                  </p>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer mt-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-4 h-4 text-[#DB4444] accent-[#DB4444]"
                />
                <span className="font-poppins text-base text-black font-medium">
                  Cash on delivery
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-6">
              <input
                type="text"
                name="coupon"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                disabled={Boolean(appliedCoupon)}
                placeholder="Coupon Code"
                className="flex-1 border border-black text-black rounded-sm font-poppins font-medium text-base leading-6 py-4 px-6 outline-0 uppercase disabled:opacity-50"
              />
              {!appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  className="bg-[#DB4444] text-white py-4 px-8 rounded-sm font-poppins font-medium text-base hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply Coupon'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="bg-gray-800 text-white py-4 px-8 rounded-sm font-poppins font-medium text-base hover:bg-black transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            {couponMessage.text && (
              <div
                className={`p-3 rounded-sm text-sm mt-2 ${
                  couponMessage.type === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-green-50 text-green-600 border border-green-200'
                }`}
              >
                {couponMessage.text}
              </div>
            )}

            {submitError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-sm text-sm mt-4">
                {submitError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full sm:w-auto border border-black/40 text-black py-4 px-8 rounded-sm font-poppins font-medium text-base leading-6 hover:bg-black hover:text-white transition-colors"
              >
                Edit Cart
              </button>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || checkoutItems.length === 0}
                className={`bg-[#DB4444] w-full sm:w-auto text-white py-4 px-12 rounded-sm font-poppins font-medium text-base leading-6 ${
                  isSubmitting || checkoutItems.length === 0
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-red-600 transition-colors'
                }`}
              >
                {isSubmitting
                  ? 'Processing...'
                  : paymentMethod === 'online'
                    ? 'Proceed to Secure Pay'
                    : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
