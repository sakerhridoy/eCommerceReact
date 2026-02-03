import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  // Optional: You can pass order data via state from Checkout page
  const location = useLocation();
  const orderNumber =
    location.state?.orderNumber ||
    'ORD' + Math.floor(100000 + Math.random() * 900000);
  const total = location.state?.total || '0.00';

  return (
    <section className="pb-[140px] bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="font-poppins font-normal text-sm text-black/50 py-20">
          <Link to="/" className="hover:text-[#DB4444]">
            Home
          </Link>{' '}
          /{' '}
          <Link to="/cart" className="hover:text-[#DB4444]">
            Cart
          </Link>{' '}
          / <span className="text-black">Checkout</span> /{' '}
          <span className="text-[#DB4444] font-medium">Order Confirmed</span>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-sm shadow-sm p-10 md:p-16 text-center">
          {/* Success Icon / Animation area */}
          <div className="mb-10">
            <div className="w-24 h-24 mx-auto bg-[#DB4444]/10 rounded-full flex items-center justify-center">
              <svg
                className="w-14 h-14 text-[#DB4444]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="font-inter font-medium text-4xl md:text-5xl text-black mb-6 leading-tight">
            Thank You For Your Order!
          </h1>

          <p className="font-poppins text-lg text-black/70 mb-10 max-w-xl mx-auto">
            Your order has been successfully placed. We're preparing your items
            and will notify you once they are on the way.
          </p>

          {/* Order Summary Card */}
          <div className="bg-[#F5F5F5] rounded-sm p-8 mb-12">
            <div className="space-y-4 text-left">
              <div className="flex justify-between font-poppins text-base">
                <span className="text-black/70">Order Number:</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              <div className="flex justify-between font-poppins text-base">
                <span className="text-black/70">Order Total:</span>
                <span className="font-medium">${total}</span>
              </div>
              <div className="flex justify-between font-poppins text-base">
                <span className="text-black/70">Payment Method:</span>
                <span className="font-medium">Cash on Delivery</span>
              </div>
              <div className="flex justify-between font-poppins text-base">
                <span className="text-black/70">Estimated Delivery:</span>
                <span className="font-medium">3-5 Business Days</span>
              </div>
            </div>
          </div>

          <p className="font-poppins text-base text-black/60 mb-12">
            A confirmation email has been sent to your email address with all
            the order details.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/track-order"
              className="bg-[#DB4444] text-white font-poppins font-medium text-base py-5 px-12 rounded-sm hover:bg-[#c0392b] transition-colors"
            >
              Track Your Order
            </Link>

            <Link
              to="/"
              className="border border-[#DB4444] text-[#DB4444] font-poppins font-medium text-base py-5 px-12 rounded-sm hover:bg-[#DB4444]/10 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;