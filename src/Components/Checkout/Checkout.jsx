import React, { useState } from 'react';
import { useShop } from '../../Context/ShopContext/ShopContext';
import bkash from '../../assets/Images/Bkash.png'
import visa from '../../assets/Images/Visa.png'
import master from '../../assets/Images/Mastercard.png'
import nagad from '../../assets/Images/Nagad.png'

const Checkout = () => {
  const { cart } = useShop();
  const shippingCost = 0; 
  const subtotal = cart.reduce(
    (acc, item) => acc + item.dPrice * item.quantity,
    0
  );
  const total = subtotal + shippingCost;

  // Form state
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

  // Form errors
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = 'First Name is required';
    if (!form.address) newErrors.address = 'Street Address is required';
    if (!form.city) newErrors.city = 'Town/City is required';
    if (!form.phone) newErrors.phone = 'Phone Number is required';
    if (!form.email) newErrors.email = 'Email Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Place Order
  const handlePlaceOrder = e => {
    e.preventDefault();
    if (!validate()) return;
    alert('Order placed successfully!');
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
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
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
                  <span>${item.dPrice * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between pb-4 border-b border-black/40">
                <span className="font-poppins font-normal text-base text-black">
                  Subtotal:
                </span>
                <span>${subtotal}</span>
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
                  ${total}
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
                  <div className="absolute right-0 top-0">
                    <div className="flex items-center gap-2">
                      <a href="">
                        <img src={bkash} alt="Visa" />
                      </a>
                      <a href="">
                        <img src={visa} alt="Mastercard" />
                      </a>
                      <a href="">
                        <img src={master} alt="Bkash" />
                      </a>
                      <a href="">
                        <img src={nagad} alt="Nagad" />
                      </a>
                    </div>
                  </div>
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
                <button className="bg-[#DB4444] text-white py-4 px-6 rounded-sm font-poppins font-medium text-base leading-6">
                  Apply Coupon
                </button>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="bg-[#DB4444] text-white py-4 px-6 rounded-sm font-poppins font-medium text-base leading-6 mt-4"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;
