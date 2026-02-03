import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../Context/ShopContext/ShopContext';
import bkash from '../../assets/Images/Bkash.png';
import visa from '../../assets/Images/Visa.png';
import master from '../../assets/Images/Mastercard.png';
import nagad from '../../assets/Images/Nagad.png';

const Checkout = () => {
  const { cart } = useShop();
  const navigate = useNavigate();

  const shippingCost = 0;
  const subtotal = cart.reduce(
    (acc, item) => acc + item.dPrice * item.quantity,
    0,
  );
  const total = subtotal + shippingCost;

  const [form, setForm] = useState({
    firstName: '',
    companyName: '',
    address: '',
    apartment: '',
    city: '',
    phone: '',
    email: '',
    saveInfo: false,
    paymentMethod: 'cod',
    coupon: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponStatus, setCouponStatus] = useState('');

  const validateField = (name, value) => {
    let error = '';

    if (
      ['firstName', 'address', 'city', 'phone', 'email'].includes(name) &&
      !value.trim()
    ) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }

    if (name === 'phone' && value) {
      if (!/^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/.test(value)) {
        error = 'Invalid phone (use 01XXXXXXXXX or +8801XXXXXXXXX)';
      }
    }

    if (name === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Invalid email format';
      }
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    ['firstName', 'address', 'city', 'phone', 'email'].forEach(field => {
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

    // Live validation for phone & email
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

  const handleApplyCoupon = () => {
    const code = form.coupon.trim().toUpperCase();
    if (code === 'SAVE10' || code === 'WELCOME10') {
      setCouponStatus('Coupon applied! 10% off');
    } else if (code) {
      setCouponStatus('Invalid coupon code');
    } else {
      setCouponStatus('');
    }
  };

  const handlePlaceOrder = e => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate order processing (you can replace with real API call later)
    setTimeout(() => {
      const fakeOrderNumber =
        'ORD' + Math.floor(100000 + Math.random() * 900000);

      navigate('/order-success', {
        state: {
          orderNumber: fakeOrderNumber,
          total: total.toFixed(2),
        },
      });

      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <>
      <section className="pb-[140px]">
        <div className="container">
          <div className="font-poppins font-normal text-sm text-black/50 py-20">
            Account / My Account / Product / View Cart /{' '}
            <span className="text-black">CheckOut</span>
          </div>
          <h2 className="font-inter font-medium text-4xl text-black leading-8 tracking-[4%] mb-12">
            Billing Details
          </h2>
          <div className="flex flex-col lg:flex-row gap-[173px]">
            {/* Left Column: Billing Form */}
            <form className="flex-1 space-y-4" onSubmit={handlePlaceOrder}>
              <div className="mb-8">
                <label className="block text-black/40 font-poppins font-normal text-base leading-6 mb-2">
                  First Name
                  <span className="text-[rgba(219,68,68,0.4)]">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full rounded-sm p-3 outline-0 bg-[#F5F5F5]"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="mb-8">
                <label className="block text-black/40 font-poppins font-normal text-base leading-6 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full rounded-sm p-3 outline-0 bg-[#F5F5F5]"
                />
              </div>
              <div className="mb-8">
                <label className="block text-black/40 font-poppins font-normal text-base leading-6 mb-2">
                  Street Address
                  <span className="text-[rgba(219,68,68,0.4)]">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full rounded-sm p-3 outline-0 bg-[#F5F5F5]"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
              <div className="mb-8">
                <label className="block text-black/40 font-poppins font-normal text-base leading-6 mb-2">
                  Apartment, floor, etc. (optional)
                </label>
                <input
                  type="text"
                  name="apartment"
                  value={form.apartment}
                  onChange={handleChange}
                  className="w-full rounded-sm p-3 outline-0 bg-[#F5F5F5]"
                />
              </div>
              <div className="mb-8">
                <label className="block text-black/40 font-poppins font-normal text-base leading-6 mb-2">
                  Town/City
                  <span className="text-[rgba(219,68,68,0.4)]">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full rounded-sm p-3 outline-0 bg-[#F5F5F5]"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>
              <div className="mb-8">
                <label className="block text-black/40 font-poppins font-normal text-base leading-6 mb-2">
                  Phone Number
                  <span className="text-[rgba(219,68,68,0.4)]">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full rounded-sm p-3 outline-0 bg-[#F5F5F5]"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div className="mb-8">
                <label className="block text-black/40 font-poppins font-normal text-base leading-6 mb-2">
                  Email Address
                  <span className="text-[rgba(219,68,68,0.4)]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full rounded-sm p-3 outline-0 bg-[#F5F5F5]"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
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

            {/* Right Column: Order Summary */}
            <div className="flex-1 space-y-4">
              {cart.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-12 h-12 object-cover"
                    />
                    <span>{item.name}</span>
                  </div>
                  <span>${(item.dPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pb-4 border-b border-black/40">
                <span className="font-poppins font-normal text-base text-black">
                  Subtotal:
                </span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-4 border-b border-black/40">
                <span className="font-poppins font-normal text-base text-black">
                  Shipping:
                </span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pb-4">
                <span className="font-poppins font-normal text-base text-black">
                  Total:
                </span>
                <span className="font-poppins font-normal text-base text-black">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Payment Options */}
              <div className="space-y-8">
                <div className="relative">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={form.paymentMethod === 'bank'}
                      onChange={handleChange}
                      className="w-4 h-4 text-black bg-black"
                    />
                    Bank
                  </label>
                  {form.paymentMethod === 'bank' && (
                    <div className="absolute right-0 top-0">
                      <div className="flex items-center gap-2">
                        <img src={bkash} alt="bKash" />
                        <img src={nagad} alt="Nagad" />
                        <img src={visa} alt="Visa" />
                        <img src={master} alt="Mastercard" />
                      </div>
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="w-4 h-4 text-red-400"
                  />
                  Cash on delivery
                </label>
              </div>

              {/* Coupon */}
              <div className="flex gap-2 pt-4">
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
                  onClick={handleApplyCoupon}
                  className="bg-[#DB4444] text-white py-4 px-6 rounded-sm font-poppins font-medium text-base leading-6"
                >
                  Apply Coupon
                </button>
              </div>
              {couponStatus && (
                <p
                  className={`text-sm mt-1 ${couponStatus.includes('Invalid') ? 'text-red-500' : 'text-green-600'}`}
                >
                  {couponStatus}
                </p>
              )}

              <button
                type="button" // ← changed from submit
                onClick={handlePlaceOrder} // ← moved here
                disabled={isSubmitting || cart.length === 0}
                className={`bg-[#DB4444] text-white py-4 px-12 rounded-sm font-poppins font-medium text-base leading-6 mt-4 ${
                  isSubmitting || cart.length === 0
                    ? 'opacity-60 cursor-not-allowed'
                    : ''
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;