import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async e => {
    e.preventDefault();

    if (!orderId.trim() || !contact.trim()) {
      setError('Please enter both Order ID and Email/Phone');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/orders/track', {
        orderNumber: orderId.trim(),
        contact: contact.trim(),
      });
      setResult(data.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not find an order matching those details.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen pb-35">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="py-16 sm:py-20">
          <p className="font-poppins text-sm text-black/50">
            <Link to="/" className="hover:text-[#DB4444] transition">
              Home
            </Link>{' '}
            / <span className="text-black font-medium">Track Your Order</span>
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <h1 className="font-inter font-medium text-2xl sm:text-3xl md:text-4xl text-center mb-8 sm:mb-12">
            Track Your Order
          </h1>

          {/* Form Card */}
          <div className="bg-white shadow-sm rounded-sm p-6 sm:p-8 md:p-12 mb-10 sm:mb-12">
            <form onSubmit={handleTrack} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block font-poppins text-base text-black/70 mb-2">
                  Order ID <span className="text-[#DB4444]">*</span>
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  placeholder="e.g. ORD123456"
                  className="w-full bg-[#F5F5F5] p-4 rounded-sm outline-none border border-transparent focus:border-[#DB4444] transition"
                  required
                />
              </div>

              <div>
                <label className="block font-poppins text-base text-black/70 mb-2">
                  Email or Phone Number{' '}
                  <span className="text-[#DB4444]">*</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="example@email.com or 01XXXXXXXXX"
                  className="w-full bg-[#F5F5F5] p-4 rounded-sm outline-none border border-transparent focus:border-[#DB4444] transition"
                  required
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#DB4444] text-white font-poppins font-medium text-base py-4 rounded-sm transition ${
                  loading
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-[#c0392b]'
                }`}
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
          </div>

          {/* Tracking Result */}
          {result && (
            <div className="bg-white shadow-sm rounded-sm p-6 sm:p-8 md:p-12">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="font-inter font-medium text-xl sm:text-2xl text-black mb-2">
                  Order #{result.orderNumber}
                </h2>
                <p className="text-[#00CC66] font-medium text-base sm:text-lg">
                  {result.orderStatus}
                </p>
                <p className="text-black/60 mt-1 text-sm sm:text-base">
                  Placed: {new Date(result.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-5 sm:space-y-6">
                <p className="font-medium text-black">
                  Latest update: {new Date(result.updatedAt).toLocaleString()}
                </p>
              </div>

              <div className="mt-8 sm:mt-10 text-center">
                <p className="text-black/60 mb-5 sm:mb-6">
                  Need help? Contact us at{' '}
                  <span className="text-[#DB4444]">support@exclusive.com</span>
                </p>
                <Link
                  to="/contact"
                  className="inline-block bg-[#DB4444] text-white px-8 sm:px-10 py-3 rounded-sm font-medium hover:bg-[#c0392b] transition"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrackOrder;
