import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../contexts/ShopContext';
import api from '../../api/client';

import bkashImg from '../../assets/images/bkash.png';
import visaImg from '../../assets/images/visa.png';
import mcImg from '../../assets/images/mc.png';
import nagadImg from '../../assets/images/nagad.png';

const Checkout = () => {
  const { cart, cartSubtotal, clearLocalCart } = useShop();
  const navigate = useNavigate();

  const shippingCost = 0;
  const subtotal = cartSubtotal;
  const total = cartSubtotal + shippingCost;

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
    coupon: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('online');

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

  const handlePlaceOrder = async e => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!validateForm()) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const cleanedItems = cart.map(item => {
        const orderItem = {
          product: item._id || item.id || item.productId,
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
        couponCode: form.coupon.trim() || undefined,
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

      if (paymentMethod === 'online') {
        const paymentRes = await api.post('/payments/create-session', {
          orderId: order._id || order.id,
        });

        const gatewayUrl =
          paymentRes.data?.data?.paymentUrl || paymentRes.data?.url;

        if (gatewayUrl) {
          clearLocalCart();
          window.location.href = gatewayUrl;
        } else {
          throw new Error('Payment gateway URL not received');
        }
      } else {
        // =================Cash on Delivery Navigation =================
        clearLocalCart();
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
            {cart.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={getItemImage(item)}
                    alt={getItemName(item)}
                    className="w-12 h-12 object-cover"
                  />
                  <span>{getItemName(item)}</span>
                </div>
                <span>
                  ৳{(getItemPrice(item) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="flex justify-between pb-4 border-b border-black/40">
              <span className="font-poppins font-normal text-base text-black">
                Subtotal:
              </span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
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
                value={form.coupon}
                onChange={handleChange}
                placeholder="Coupon Code"
                className="flex-1 border border-black text-black/50 rounded-sm font-poppins font-medium text-base leading-6 py-4 px-6 outline-0"
              />
              <button
                type="button"
                className="bg-[#DB4444] text-white py-4 px-8 rounded-sm font-poppins font-medium text-base hover:bg-red-600 transition-colors"
              >
                Apply Coupon
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-sm text-sm mt-4">
                {submitError}
              </div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || cart.length === 0}
              className={`bg-[#DB4444] w-full sm:w-auto text-white py-4 px-12 rounded-sm font-poppins font-medium text-base leading-6 mt-6 ${
                isSubmitting || cart.length === 0
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
    </section>
  );
};

export default Checkout;