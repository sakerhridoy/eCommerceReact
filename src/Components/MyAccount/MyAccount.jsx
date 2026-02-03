import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VscEye } from 'react-icons/vsc';
import { VscEyeClosed } from 'react-icons/vsc';
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { auth } from '../../firebase/firebase.config';
import { useAuth } from '../../context/AuthContext';

const MyAccount = () => {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '' || '',
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

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(''); // clear error on change
  };

  const handleSave = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      /* ================= NAME UPDATE ================= */
      const fullName =
        `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      if (fullName && fullName !== user?.displayName) {
        await updateProfile(auth.currentUser, { displayName: fullName });
        setUser({ ...user, displayName: fullName });
      }

      /* ================= PASSWORD UPDATE ================= */
      if (form.newPassword) {
        if (!form.currentPassword) {
          throw new Error('Current password is required');
        }
        if (form.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters');
        }
        if (form.newPassword !== form.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          form.currentPassword,
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, form.newPassword);
      }

      setSuccess('Profile updated successfully ✓');
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: user?.displayName?.split(' ')[0] || '',
      lastName: user?.displayName?.split(' ')[1] || '' || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
  };

  return (
    <section className="pb-[140px]">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb + Welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-10 md:py-20 gap-4">
          <p className="font-poppins font-normal leading-[21px] text-sm text-black/50">
            <Link to="/" className="hover:text-[#DB4444] transition-colors">
              Home
            </Link>
            / <span className="text-black">My Account</span>
          </p>
          <p className="font-poppins font-normal leading-[21px] text-sm text-black">
            Welcome!
            <span className="text-[#DB4444]">
              {user?.displayName || 'User'}
            </span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* LEFT SIDEBAR – Navigation */}
          <aside className="w-[25%]">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium font-poppins text-base leading-6 mb-4">
                  Manage My Account
                </h4>
                <div className="space-y-2 text-black/50 flex flex-col ps-[35px]">
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    My Profile
                  </a>
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    Address Book
                  </a>
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    My Payment Options
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-medium font-poppins text-base leading-6 mb-4">
                  My Orders
                </h4>
                <div className="space-y-2 text-black/50 flex flex-col ps-[35px]">
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    My Returns
                  </a>
                  <a className="hover:text-[#DB4444] font-poppins font-normal text-base leading-6">
                    My Cancellations
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-medium font-poppins text-base leading-6 mb-4">
                  My WishList
                </h4>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT – Edit Form */}
          <main className="lg:w-3/4">
            <div className=" bg-white shadow-sm py-10 px-20 rounded-sm">
              <h3 className="text-[#DB4444] font-medium font-poppins text-xl leading-7 mb-4">
                Edit Your Profile
              </h3>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                  {success}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                {/* First & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-normal font-poppins text-base leading-6 mb-2 block">
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
                    <label className="font-normal font-poppins text-base leading-6 mb-2 block">
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
                {/* Email (disabled) */}
                <div>
                  <label className="font-normal font-poppins text-base leading-6 mb-2 block">
                    Email
                  </label>
                  <input
                    value={form.email}
                    disabled
                    className="w-full bg-[#F5F5F5] px-4 py-3 rounded-md text-gray-500 cursor-not-allowed"
                  />
                </div>
                {/* Password fields */}
                <div className="space-y-6 pt-4 border-t border-gray-100">
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
                      className="absolute right-4 top-10 text-gray-500 hover:text-[#DB4444]"
                    >
                      {showCurrent ? <VscEyeClosed /> : <VscEye />}
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
                      className="absolute right-4 top-10 text-gray-500 hover:text-[#DB4444]"
                    >
                      {showNew ? <VscEyeClosed /> : <VscEye />}
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
                      className="absolute right-4 top-10 text-gray-500 hover:text-[#DB4444]"
                    >
                      {showConfirm ? <VscEyeClosed /> : <VscEye />}
                    </button>
                  </div>
                </div>
                {/* Submit */}
                {/* Buttons */}
                <div className="flex justify-end gap-6 pt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="font-normal font-poppins text-base leading-6 py-4 bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-[#DB4444] font-normal font-poppins text-base leading-6 text-white px-12 py-4 rounded-sm ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
