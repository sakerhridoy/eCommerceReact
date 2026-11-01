import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { MdOutlineRemoveShoppingCart } from 'react-icons/md';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (orderId) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      if (countdown === 0) {
        navigate('/my-orders', { replace: true });
      }

      return () => clearInterval(timer);
    }
  }, [orderId, countdown, navigate]);

  return (
    <section className="py-20 md:py-32 font-poppins bg-gray-50/30 min-h-[60vh] flex items-center">
      <div className="container mx-auto px-4 text-center">
        {orderId ? (
          <div className="max-w-xl mx-auto bg-white p-8 md:p-12 rounded-sm shadow-[0px_0px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <FaCheckCircle className="text-6xl md:text-7xl text-green-500 mx-auto mb-6 drop-shadow-sm animate-bounce" />

            <h2 className="text-3xl md:text-4xl font-inter font-semibold mb-4 text-black">
              Order Successful!
            </h2>

            <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
              Thank you for your purchase. Your order has been placed
              successfully and is currently being processed.
            </p>

            <div className="bg-[#F5F5F5] p-5 rounded-sm mb-8 inline-block w-full border border-gray-200">
              <p className="text-sm text-gray-500 mb-1 font-medium">
                Transaction / Order ID:
              </p>
              <p className="text-lg font-semibold text-black break-all tracking-wide">
                {orderId}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/my-orders"
                className="bg-[#DB4444] text-white px-8 py-3.5 rounded-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
              >
                View My Orders
              </Link>
              <Link
                to="/shop"
                className="bg-gray-900 text-white px-8 py-3.5 rounded-sm font-medium hover:bg-black transition-colors shadow-sm"
              >
                Continue Shopping
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-8 font-medium">
              Redirecting to your account in{' '}
              <span className="text-[#DB4444] text-sm">{countdown}</span>{' '}
              seconds...
            </p>
          </div>
        ) : (
          /* ================= ERROR ================= */
          <div className="max-w-lg mx-auto bg-white p-8 md:p-12 rounded-sm shadow-[0px_0px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <MdOutlineRemoveShoppingCart className="text-6xl md:text-7xl text-[#DB4444] mx-auto mb-6 opacity-80" />

            <h2 className="text-2xl md:text-3xl font-inter font-semibold mb-4 text-black">
              No recent order found
            </h2>

            <p className="text-gray-500 mb-8 text-sm md:text-base">
              We couldn't find any valid order details in this link. Please
              check your account or continue shopping.
            </p>

            <Link
              to="/shop"
              className="bg-[#DB4444] text-white px-8 py-3.5 rounded-sm font-medium hover:bg-red-600 transition-colors inline-block shadow-sm"
            >
              Back to Shop
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderSuccess;