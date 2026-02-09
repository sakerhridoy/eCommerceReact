// src/pages/TrackOrder.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState(''); // email or phone
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = e => {
    e.preventDefault();

    if (!orderId.trim() || !contact.trim()) {
      setError('Please enter both Order ID and Email/Phone');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    // Simulate API call (replace with real backend later)
    setTimeout(() => {
      // Fake successful response
      if (orderId === 'ORD123456' || orderId === '123456') {
        setResult({
          orderId: orderId.toUpperCase(),
          status: 'In Transit',
          estimatedDelivery: 'February 07, 2026',
          currentLocation: 'Sylhet Sorting Hub',
          history: [
            {
              date: 'Feb 04, 2026 10:30 AM',
              event: 'Order Placed',
              location: 'Sylhet',
            },
            {
              date: 'Feb 04, 2026 02:15 PM',
              event: 'Order Confirmed',
              location: 'Dhaka',
            },
            {
              date: 'Feb 05, 2026 09:45 AM',
              event: 'Shipped',
              location: 'Dhaka Hub',
            },
            {
              date: 'Feb 05, 2026 04:20 PM',
              event: 'In Transit',
              location: 'Sylhet Sorting Hub',
            },
          ],
        });
      } else {
        setError('No order found with this ID. Please check and try again.');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <section className="pb-35 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="py-20">
          <p className="font-poppins text-sm text-black/50">
            <Link to="/" className="hover:text-[#DB4444] transition">
              Home
            </Link>{' '}
            / <span className="text-black font-medium">Track Your Order</span>
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <h1 className="font-inter font-medium text-3xl md:text-4xl text-center mb-12">
            Track Your Order
          </h1>

          {/* Form Card */}
          <div className="bg-white shadow-sm rounded-sm p-8 md:p-12 mb-12">
            <form onSubmit={handleTrack} className="space-y-6">
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
            <div className="bg-white shadow-sm rounded-sm p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="font-inter font-medium text-2xl text-black mb-2">
                  Order #{result.orderId}
                </h2>
                <p className="text-[#00CC66] font-medium text-lg">
                  {result.status}
                </p>
                <p className="text-black/60 mt-1">
                  Estimated Delivery: {result.estimatedDelivery}
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                {result.history.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#DB4444]/10 flex items-center justify-center">
                        <span className="text-[#DB4444] text-xl">✓</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-black">{step.event}</p>
                      <p className="text-sm text-black/60">{step.date}</p>
                      <p className="text-sm text-black/50">{step.location}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <p className="text-black/60 mb-6">
                  Need help? Contact us at{' '}
                  <span className="text-[#DB4444]">support@exclusive.com</span>
                </p>
                <Link
                  to="/contact"
                  className="inline-block bg-[#DB4444] text-white px-10 py-3 rounded-sm font-medium hover:bg-[#c0392b] transition"
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
