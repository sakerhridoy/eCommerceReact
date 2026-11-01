import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';
import {
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiPackage,
  FiRotateCcw,
  FiXCircle,
  FiHeart,
  FiGrid,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getMyOrders } from '../../api/catalog';
import api from '../../api/client';
import useShopStore from '../../store/cartStore';

const MyAccount = () => {
  const { user, setUser } = useAuth();
  const useNavigateInstance = useNavigate();
  const wishlistItems = useShopStore(state => state.wishlist);

  const [activeTab, setActiveTab] = useState('profile');

  const [firstName, ...lastNameParts] = (user?.name || '').split(' ');

  const [form, setForm] = useState({
    firstName: firstName || '',
    lastName: lastNameParts.join(' '),
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [orders, setOrders] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (!['returns', 'cancellations'].includes(activeTab)) {
      setFetchingData(false);
      return;
    }

    const fetchData = async () => {
      setFetchingData(true);
      try {
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch data for account tab:', err);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSave = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const fullName =
        `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      if (fullName && fullName !== user?.name) {
        const { data } = await api.put('/auth/profile', { name: fullName });
        setUser(data.data);
      }

      if (form.newPassword) {
        if (!form.currentPassword)
          throw new Error('Current password is required');
        if (form.newPassword.length < 6)
          throw new Error('New password must be at least 6 characters');
        if (form.newPassword !== form.confirmPassword)
          throw new Error('Passwords do not match');

        await api.post('/auth/change-password', {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        });
      }

      setSuccess('Profile updated successfully ✓');
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: firstName || '',
      lastName: lastNameParts.join(' '),
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
  };

  const filteredOrders = orders.filter(order => {
    const status = order.orderStatus?.toUpperCase();
    if (activeTab === 'returns') return status === 'RETURNED';
    if (activeTab === 'cancellations') return status === 'CANCELLED';
    return true;
  });

  // Check if user is admin (role lowercase 'admin' as configured earlier)
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <section className="pb-35 font-poppins">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-10 md:py-16 gap-4">
          <p className="font-normal text-sm text-black/50">
            <Link to="/" className="hover:text-[#DB4444] transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-black">My Account</span>
          </p>
          <p className="font-normal text-sm text-black">
            Welcome!{' '}
            <span className="text-[#DB4444] font-semibold">
              {user?.name || 'User'}
            </span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* ================= LEFT SIDEBAR – Navigation ================= */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm space-y-6">
              {/* ADMIN DASHBOARD LINK (Only for admin) */}
              {isAdmin && (
                <div className="pb-4 border-b border-gray-100">
                  <button
                    onClick={() => useNavigateInstance('/admin/orders')} // Apnar admin dashboard route
                    className="w-full bg-[#DB4444] text-white py-2.5 px-4 rounded-sm flex items-center justify-center gap-2 font-medium text-sm hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <FiGrid size={16} /> Admin Dashboard
                  </button>
                </div>
              )}

              {/* Manage My Account */}
              <div>
                <h4 className="font-semibold text-base text-black mb-3 flex items-center gap-2">
                  <FiUser className="text-[#DB4444]" /> Manage My Account
                </h4>
                <div className="space-y-2 ps-6 flex flex-col text-sm">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`text-left py-1.5 transition-colors ${activeTab === 'profile' ? 'text-[#DB4444] font-medium' : 'text-black/60 hover:text-[#DB4444]'}`}
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`text-left py-1.5 transition-colors ${activeTab === 'address' ? 'text-[#DB4444] font-medium' : 'text-black/60 hover:text-[#DB4444]'}`}
                  >
                    Address Book
                  </button>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`text-left py-1.5 transition-colors ${activeTab === 'payment' ? 'text-[#DB4444] font-medium' : 'text-black/60 hover:text-[#DB4444]'}`}
                  >
                    My Payment Options
                  </button>
                </div>
              </div>

              {/* My Orders */}
              <div>
                <h4 className="font-semibold text-base text-black mb-3 flex items-center gap-2">
                  <FiPackage className="text-[#DB4444]" /> My Orders
                </h4>
                <div className="space-y-2 ps-6 flex flex-col text-sm">
                  <button
                    onClick={() => useNavigateInstance('/my-orders')}
                    className="text-left py-1.5 text-black/60 hover:text-[#DB4444] transition-colors"
                  >
                    All Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('returns')}
                    className={`text-left py-1.5 transition-colors ${activeTab === 'returns' ? 'text-[#DB4444] font-medium' : 'text-black/60 hover:text-[#DB4444]'}`}
                  >
                    My Returns
                  </button>
                  <button
                    onClick={() => setActiveTab('cancellations')}
                    className={`text-left py-1.5 transition-colors ${activeTab === 'cancellations' ? 'text-[#DB4444] font-medium' : 'text-black/60 hover:text-[#DB4444]'}`}
                  >
                    My Cancellations
                  </button>
                </div>
              </div>

              {/* My WishList */}
              <div>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full text-left font-semibold text-base flex items-center gap-2 transition-colors ${activeTab === 'wishlist' ? 'text-[#DB4444]' : 'text-black hover:text-[#DB4444]'}`}
                >
                  <FiHeart className="text-[#DB4444]" /> My WishList
                </button>
              </div>
            </div>
          </aside>

          {/* ================= RIGHT CONTENT ================= */}
          <main className="w-full lg:w-3/4">
            {/* VIEW 1: MY PROFILE (EDIT PROFILE) */}
            {activeTab === 'profile' && (
              <div className="bg-white shadow-sm border border-gray-100 py-10 px-6 md:px-12 rounded-sm">
                <h3 className="text-[#DB4444] font-medium text-xl leading-7 mb-6">
                  Edit Your Profile
                </h3>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-normal text-base leading-6 mb-2 block text-black">
                        First Name
                      </label>
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className="w-full bg-[#F5F5F5] border border-transparent focus:border-[#DB4444] rounded-md px-4 py-3 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-normal text-base leading-6 mb-2 block text-black">
                        Last Name
                      </label>
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className="w-full bg-[#F5F5F5] border border-transparent focus:border-[#DB4444] rounded-md px-4 py-3 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-normal text-base leading-6 mb-2 block text-black">
                      Email
                    </label>
                    <input
                      value={form.email}
                      disabled
                      className="w-full bg-[#F5F5F5] px-4 py-3 rounded-md text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-medium text-gray-800">
                      Change Password
                    </h4>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        name="currentPassword"
                        placeholder="Current password"
                        value={form.currentPassword}
                        onChange={handleChange}
                        className="w-full bg-[#F5F5F5] border border-transparent focus:border-[#DB4444] rounded-md px-4 py-3 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-4 top-9 text-gray-500 hover:text-[#DB4444]"
                      >
                        {showCurrent ? (
                          <VscEyeClosed size={18} />
                        ) : (
                          <VscEye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type={showNew ? 'text' : 'password'}
                        name="newPassword"
                        placeholder="New password (min 6 characters)"
                        value={form.newPassword}
                        onChange={handleChange}
                        className="w-full bg-[#F5F5F5] border border-transparent focus:border-[#DB4444] rounded-md px-4 py-3 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-9 text-gray-500 hover:text-[#DB4444]"
                      >
                        {showNew ? (
                          <VscEyeClosed size={18} />
                        ) : (
                          <VscEye size={18} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-[#F5F5F5] border border-transparent focus:border-[#DB4444] rounded-md px-4 py-3 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-9 text-gray-500 hover:text-[#DB4444]"
                      >
                        {showConfirm ? (
                          <VscEyeClosed size={18} />
                        ) : (
                          <VscEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-6 pt-6">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="font-normal text-base py-4 bg-transparent text-gray-600 hover:text-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`bg-[#DB4444] font-normal text-base text-white px-12 py-4 rounded-sm transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-600'}`}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 2: ADDRESS BOOK */}
            {activeTab === 'address' && (
              <div className="bg-white shadow-sm border border-gray-100 p-8 rounded-sm">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-[#DB4444] font-medium text-xl">
                    Address Book
                  </h3>
                  <button className="bg-[#DB4444] text-white px-4 py-2 rounded-sm text-sm hover:bg-red-600 transition-colors">
                    + Add New Address
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-sm bg-gray-50 relative">
                    <span className="absolute top-3 right-3 text-xs bg-red-100 text-[#DB4444] px-2 py-0.5 rounded font-medium">
                      Default
                    </span>
                    <p className="font-semibold text-black">
                      {user?.name || 'Customer Name'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Sylhet, Shiber Bazar - 3100
                    </p>
                    <p className="text-sm text-gray-600">Bangladesh</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Phone: +8801700000000
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: MY PAYMENT OPTIONS */}
            {activeTab === 'payment' && (
              <div className="bg-white shadow-sm border border-gray-100 p-8 rounded-sm">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-[#DB4444] font-medium text-xl">
                    My Payment Methods
                  </h3>
                  <button className="bg-[#DB4444] text-white px-4 py-2 rounded-sm text-sm hover:bg-red-600 transition-colors">
                    + Add Payment Method
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-sm bg-gray-50">
                    <div className="flex items-center gap-3">
                      <FiCreditCard size={24} className="text-[#DB4444]" />
                      <div>
                        <p className="font-medium text-sm text-black">
                          SSLCommerz Sandbox Gateway
                        </p>
                        <p className="text-xs text-gray-500">
                          Supports bKash, Nagad, Visa, MasterCard
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: MY RETURNS & CANCELLATIONS */}
            {['returns', 'cancellations'].includes(activeTab) && (
              <div className="bg-white shadow-sm border border-gray-100 p-8 rounded-sm">
                <h3 className="text-[#DB4444] font-medium text-xl mb-6 capitalize">
                  My {activeTab}
                </h3>

                {fetchingData ? (
                  <div className="text-center py-10 text-gray-500">
                    Loading {activeTab}...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded border border-dashed">
                    {activeTab === 'returns' ? (
                      <FiRotateCcw
                        className="mx-auto text-gray-300 mb-2"
                        size={40}
                      />
                    ) : (
                      <FiXCircle
                        className="mx-auto text-gray-300 mb-2"
                        size={40}
                      />
                    )}
                    <p className="text-gray-500 text-sm">
                      No {activeTab} found.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <div
                        key={order._id}
                        className="p-4 border rounded-sm flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-sm">
                            Order #
                            {order.orderNumber ||
                              order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Date:{' '}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-[#DB4444] rounded text-xs font-semibold uppercase">
                          {order.orderStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 5: MY WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="bg-white shadow-sm border border-gray-100 p-8 rounded-sm">
                <h3 className="text-[#DB4444] font-medium text-xl mb-6">
                  My Wishlist
                </h3>

                {fetchingData ? (
                  <div className="text-center py-10 text-gray-500">
                    Loading wishlist...
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded border border-dashed">
                    <FiHeart className="mx-auto text-gray-300 mb-2" size={40} />
                    <p className="text-gray-500 text-sm">
                      Your wishlist is empty.
                    </p>
                    <Link
                      to="/shop"
                      className="inline-block mt-4 bg-[#DB4444] text-white px-6 py-2 rounded text-sm"
                    >
                      Explore Shop
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistItems.map(item => (
                      <div
                        key={item._id || item.id}
                        className="border p-4 rounded-sm relative group bg-gray-50"
                      >
                        <img
                          src={
                            item.image ||
                            item.img ||
                            item.thumbnail ||
                            item.images?.[0] ||
                            'https://via.placeholder.com/150'
                          }
                          alt={item.name || item.title}
                          className="w-full h-36 object-cover mb-3 rounded"
                        />
                        <h4 className="font-medium text-sm text-black line-clamp-1">
                          {item.name || item.title}
                        </h4>
                        <p className="text-[#DB4444] font-semibold text-sm mt-1">
                          ৳{item.price ?? item.dPrice}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;